import { NextResponse } from "next/server";

export interface NewsItem {
  title: string;
  source: string;
  link: string;
  pubDate: string;
}

const NAVER_NEWS_URL = "https://openapi.naver.com/v1/search/news.json";
// 배포/로컬 결과 불일치 원인(캐시) 제거: 매 요청 실시간 조회
const REVALIDATE_SECONDS = 0;
const DISPLAY_PER_QUERY = 10;
const MAX_OUTPUT = 5;

/**
 * 완전 리셋된 검색 로직
 * - 검색 키워드 타겟팅: 아래 3개 주제에 집중
 * - 검색어 조합(필수): (세종시 OR 공공) + (생성형 AI OR 행정 혁신 OR 데이터 기반)
 *   → 모든 요청의 query 파라미터에 반드시 포함
 */
const MUST_INCLUDE_QUERY = "(세종시 OR 공공) (\"생성형 AI\" OR \"행정 혁신\" OR \"데이터 기반\")";
const TOPIC_QUERIES = [
  "\"공공 AI\" \"행정 혁신\"",
  "\"데이터 기반\" \"행정 활성화\"",
  "\"생성형 AI\" \"공공 플랫폼\"",
] as const;

const SEARCH_QUERIES = TOPIC_QUERIES.map((q) => `${MUST_INCLUDE_QUERY} ${q}`);

/** 제목에서 HTML 태그·엔티티 제거 (<b>, &quot; 등) */
function sanitizeTitle(raw: string): string {
  return (raw || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .trim();
}

function parsePubDate(pubDate: string): number {
  const d = new Date(pubDate);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

function sanitizeText(raw: string): string {
  return (raw || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .trim();
}

function dedupeByLink(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const link = (item.link || "").trim().toLowerCase();
    if (!link || seen.has(link)) return false;
    seen.add(link);
    return true;
  });
}

function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    const map: Record<string, string> = {
      "www.chosun.com": "조선일보",
      "www.donga.com": "동아일보",
      "www.hani.co.kr": "한겨레",
      "www.khan.co.kr": "경향신문",
      "www.joongang.co.kr": "중앙일보",
      "news.kbs.co.kr": "KBS",
      "news.sbs.co.kr": "SBS",
      "www.yna.co.kr": "연합뉴스",
      "www.newsis.com": "뉴시스",
      "www.etnews.com": "전자신문",
    };
    return map[hostname] || hostname.replace("www.", "").split(".")[0];
  } catch {
    return "뉴스";
  }
}

/** NAVER_NEWS_* 우선, 없으면 NAVER_* (로그인/검색 동일 앱일 때) */
function getNaverNewsCreds(): { id: string; secret: string } | null {
  const id = process.env.NAVER_NEWS_CLIENT_ID || process.env.NAVER_CLIENT_ID;
  const secret = process.env.NAVER_NEWS_CLIENT_SECRET || process.env.NAVER_CLIENT_SECRET;
  if (!id || !secret) return null;
  return { id, secret };
}

function getNaverSearchErrorHint(status: number): string {
  if (status === 401) return "API 키가 유효하지 않음";
  if (status === 403) return "네이버 콘솔에서 뉴스 API 권한 미설정";
  if (status === 400) return "검색어 쿼리 오류";
  return `네이버 뉴스 API 호출 실패 (HTTP ${status})`;
}

/**
 * 네이버 검색(Search) API - 뉴스
 * 헤더: X-Naver-Client-Id, X-Naver-Client-Secret
 */
async function fetchNaverNews(
  query: string
): Promise<{ items: (NewsItem & { description: string })[]; errorHint?: string; status?: number; raw?: unknown }> {
  const creds = getNaverNewsCreds();
  if (!creds) {
    return {
      items: [],
      errorHint: "NAVER_NEWS_CLIENT_ID / NAVER_NEWS_CLIENT_SECRET 환경 변수가 로드되지 않았습니다.",
    };
  }

  const clientId = creds.id;
  const clientSecret = creds.secret;

  const params = new URLSearchParams({
    query,
    display: String(DISPLAY_PER_QUERY),
    sort: "date",
  });

  const requestUrl = `${NAVER_NEWS_URL}?${params.toString()}`;
  console.log("[news][naver] ID 존재 여부:", !!clientId);
  console.log("[news][naver] 요청 URL:", requestUrl);
  console.log("[news][naver] 요청 헤더:", {
    "X-Naver-Client-Id": `${clientId.slice(0, 4)}***`,
    "X-Naver-Client-Secret": "***",
  });

  const res = await fetch(requestUrl, {
    method: "GET",
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    cache: "no-store",
    next: { revalidate: REVALIDATE_SECONDS },
  });

  console.log("[news][naver] 응답 status:", res.status);

  let data: unknown = null;
  try {
    data = await res.json();
  } catch (error) {
    console.log("[news][naver] 응답 JSON 파싱 실패:", String(error));
    return { items: [], status: res.status, errorHint: getNaverSearchErrorHint(res.status) };
  }
  console.log("[news][naver] 응답 데이터:", data);

  if (!res.ok) {
    return { items: [], status: res.status, raw: data, errorHint: getNaverSearchErrorHint(res.status) };
  }

  if (
    typeof data === "object" &&
    data !== null &&
    ("errorMessage" in data || "errorCode" in data)
  ) {
    const errorMessage = "errorMessage" in data ? String((data as any).errorMessage) : "";
    const errorCode = "errorCode" in data ? String((data as any).errorCode) : "";
    return {
      items: [],
      status: res.status,
      raw: data,
      errorHint: `네이버 뉴스 API 에러 응답: ${errorCode} ${errorMessage}`.trim(),
    };
  }

  const items = (data as any)?.items || [];

  return {
    items: (items as any[]).map(
    (item: { title?: string; originallink?: string; link?: string; pubDate?: string; description?: string }) => {
      const link = (item.originallink || item.link || "").trim();
      return {
        title: sanitizeTitle(item.title || ""),
        source: extractSource(link),
        link,
        pubDate: item.pubDate || "",
        description: sanitizeText(item.description || ""),
      };
    }
    ),
    status: res.status,
    raw: data,
  };
}

// 네이버 API 실패/결과 없음 시 노출되는 기본 5건(로컬/배포 동일하게 고정)
const FALLBACK_NEWS: NewsItem[] = [
  {
    title: "범정부 생성형 AI 플랫폼 구축…'공공 AI법' 국회 본회의 통과",
    source: "연합뉴스",
    link: "https://www.yna.co.kr/view/AKR20260129138900530",
    pubDate: new Date().toISOString(),
  },
  {
    title: "생성형을 넘어 에이전트로…공공 행정 분야 AI 2.0 전환 박차",
    source: "동아일보",
    link: "https://www.donga.com/news/It/article/all/20260116/133171582/1",
    pubDate: new Date().toISOString(),
  },
  {
    title: "AI 기반 행정혁신 나선 관악구…주민체감형 스마트서비스 확충",
    source: "연합뉴스",
    link: "https://www.yna.co.kr/view/AKR20260303152200004",
    pubDate: new Date().toISOString(),
  },
  {
    title: "민원 답변부터 정책 결정까지…지자체 행정에 생성형 AI가 들어왔다",
    source: "더포스트",
    link: "http://www.thepostkorea.com/17160",
    pubDate: new Date().toISOString(),
  },
  {
    title: "데이터 기반 행정 활성화…공공부문 AI 활용 법적 기반 마련",
    source: "연합뉴스",
    link: "https://www.yna.co.kr/view/AKR20260129138900530",
    pubDate: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const merged: (NewsItem & { description: string })[] = [];
    const errorHints: string[] = [];

    if (getNaverNewsCreds()) {
      for (const q of SEARCH_QUERIES) {
        const result = await fetchNaverNews(q);
        merged.push(...result.items);
        if (result.errorHint) errorHints.push(`[${q}] ${result.errorHint}`);
      }
    } else {
      errorHints.push("환경 변수가 없습니다: NAVER_NEWS_CLIENT_ID / NAVER_NEWS_CLIENT_SECRET");
    }

    const deduped = dedupeByLink(merged.map(({ description: _d, ...rest }) => rest));

    // 정렬 우선순위:
    // 1) 제목에 '세종' + '데이터' 동시 포함 최상단
    // 2) 최신순(pubDate desc)
    const sorted = deduped.sort((a, b) => {
      const aBoost = a.title.includes("세종") && a.title.includes("데이터") ? 1 : 0;
      const bBoost = b.title.includes("세종") && b.title.includes("데이터") ? 1 : 0;
      if (bBoost !== aBoost) return bBoost - aBoost;
      return parsePubDate(b.pubDate) - parsePubDate(a.pubDate);
    });

    let news = sorted.slice(0, MAX_OUTPUT);

    if (news.length === 0) {
      const reason = errorHints.length > 0 ? errorHints.join(" / ") : "검색 결과가 없습니다 (items.length === 0).";
      return NextResponse.json({
        news: FALLBACK_NEWS,
        updatedAt: new Date().toISOString(),
        error: false,
        message: reason,
      });
    }

    return NextResponse.json({
      news,
      updatedAt: new Date().toISOString(),
      error: false,
    });
  } catch {
    return NextResponse.json({
      news: FALLBACK_NEWS,
      updatedAt: new Date().toISOString(),
      error: false,
      message: "뉴스 API 처리 중 예외가 발생했습니다.",
    });
  }
}
