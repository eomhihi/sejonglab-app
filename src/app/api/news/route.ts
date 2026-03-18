import { NextResponse } from "next/server";

export interface NewsItem {
  title: string;
  source: string;
  link: string;
  pubDate: string;
}

const NAVER_NEWS_URL = "https://openapi.naver.com/v1/search/news.json";
const REVALIDATE_SECONDS = 3600;
const DISPLAY_PER_QUERY = 10;
const MAX_OUTPUT = 5;

/**
 * 검색 쿼리(구문검색 + OR 조합)
 * ("데이터 행정") OR ("빅데이터 정책") OR (세종시 + "디지털 혁신")
 */
const SEARCH_QUERY = "\"데이터 행정\" OR \"빅데이터 정책\" OR (세종시 \"디지털 혁신\")";

const HARD_FILTER_KEYWORDS = ["데이터", "정책", "혁신", "디지털", "지능형"] as const;

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

const FALLBACK_NEWS: NewsItem[] = [
  { title: "세종시, 데이터 기반 정책 추진", source: "연합뉴스", link: "https://www.yna.co.kr", pubDate: new Date().toISOString() },
  { title: "지자체 데이터·AI 혁신 사례", source: "전자신문", link: "https://www.etnews.com", pubDate: new Date().toISOString() },
  { title: "시민 참여와 스마트시티", source: "뉴시스", link: "https://www.newsis.com", pubDate: new Date().toISOString() },
  { title: "데이터 행정 혁신 정책 동향", source: "동아일보", link: "https://www.donga.com", pubDate: new Date().toISOString() },
  { title: "세종시 정책·민원 디지털 전환", source: "한국경제", link: "https://www.hankyung.com", pubDate: new Date().toISOString() },
];

export async function GET() {
  try {
    const merged: (NewsItem & { description: string })[] = [];
    const errorHints: string[] = [];

    if (getNaverNewsCreds()) {
      const result = await fetchNaverNews(SEARCH_QUERY);
      merged.push(...result.items);
      if (result.errorHint) errorHints.push(`[query] ${result.errorHint}`);
    } else {
      errorHints.push("환경 변수가 없습니다: NAVER_NEWS_CLIENT_ID / NAVER_NEWS_CLIENT_SECRET");
    }

    // Hard filter: title/description 중 하나라도 키워드 1개 이상 포함해야 함
    const hardFiltered = merged.filter((item) => {
      const text = `${item.title} ${item.description}`;
      return HARD_FILTER_KEYWORDS.some((k) => text.includes(k));
    });

    const deduped = dedupeByLink(hardFiltered.map(({ description: _d, ...rest }) => rest));

    // 정렬 우선순위:
    // 1) 제목에 '세종'과 '데이터' 동시 포함 최상단
    // 2) 최신순(pubDate desc)
    // 3) 제목/요약에 하드키워드가 많이 포함될수록 상단
    const score = (title: string, description: string) => {
      const t = `${title} ${description}`;
      const count = HARD_FILTER_KEYWORDS.reduce((acc, k) => acc + (t.includes(k) ? 1 : 0), 0);
      const sejongDataBoost = title.includes("세종") && title.includes("데이터") ? 100 : 0;
      return sejongDataBoost + count;
    };

    const descriptionByLink = new Map<string, string>();
    for (const it of hardFiltered) descriptionByLink.set(it.link.trim(), it.description);

    const sorted = deduped
      .map((n) => ({ n, desc: descriptionByLink.get(n.link.trim()) || "" }))
      .sort((a, b) => {
        const as = score(a.n.title, a.desc);
        const bs = score(b.n.title, b.desc);
        if (bs !== as) return bs - as;
        return parsePubDate(b.n.pubDate) - parsePubDate(a.n.pubDate);
      })
      .map(({ n }) => n);

    let news = sorted.slice(0, MAX_OUTPUT);

    if (news.length === 0) {
      const reason = errorHints.length > 0 ? errorHints.join(" / ") : "검색 결과가 없습니다 (items.length === 0).";
      return NextResponse.json({
        news: FALLBACK_NEWS,
        updatedAt: new Date().toISOString(),
        error: true,
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
      error: true,
      message: "뉴스 API 처리 중 예외가 발생했습니다.",
    });
  }
}
