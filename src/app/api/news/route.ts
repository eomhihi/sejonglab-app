import { NextResponse } from "next/server";

export interface NewsItem {
  title: string;
  source: string;
  link: string;
  pubDate: string;
}

// Naver News Search API
const NAVER_NEWS_ENDPOINT = "https://openapi.naver.com/v1/search/news.json";
// 네이버 검색 문법: OR는 `|`, 정확 구문은 따옴표로 감싼다.
const NAVER_QUERY = '"데이터 혁신"|"세종시 정책"';
const NAVER_DISPLAY = 20;
// 최신 정책 반영을 위해 최신순(date) 우선
const NAVER_SORT: "sim" | "date" = "date";

// Weekly update (7 * 24 * 60 * 60)
const REVALIDATE_SECONDS = 604800;
const MAX_OUTPUT = 5;
const RECENT_DAYS = 7;

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

/** 네이버 API description도 일부 HTML 강조가 들어올 수 있음 */
function sanitizeDescription(raw: string): string {
  return sanitizeTitle(raw);
}

function parsePubDate(pubDate: string): number {
  const d = new Date(pubDate);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
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

function normalizeTitleKey(title: string): string {
  return (title || "")
    .replace(/\s+/g, " ")
    .replace(/["'“”‘’]/g, "")
    .trim()
    .toLowerCase();
}

function dedupeByTitle(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const k = normalizeTitleKey(item.title);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function titleQualityScore(title: string): number {
  const t = title || "";
  let score = 0;
  // 키워드 우선순위: "데이터 혁신"이 포함된 기사를 최우선
  if (t.includes("데이터")) score += 2;
  if (t.includes("혁신")) score += 3;
  if (t.includes("데이터") && t.includes("혁신")) score += 3;

  // 지역·정책 키워드
  if (t.includes("세종")) score += 2;
  if (t.includes("정책")) score += 2;
  return score;
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

function publisherQualityScore(source: string, link: string): number {
  const s = (source || "").toLowerCase();
  const u = (link || "").toLowerCase();

  // 블로그/커뮤니티/홍보성 도메인 감점(네이버 검색 결과 섞일 수 있음)
  if (u.includes("blog.") || u.includes("post.naver.com") || u.includes("cafe.naver.com")) return -4;

  // 정론지/주요 통신사 가점(간단 룰)
  const premium = [
    "연합뉴스",
    "kbs",
    "sbs",
    "mbc",
    "조선",
    "중앙",
    "동아",
    "한겨레",
    "경향",
    "한국일보",
    "서울신문",
    "매일경제",
    "한국경제",
    "전자신문",
  ];
  if (premium.some((p) => s.includes(p.toLowerCase()))) return 2;
  return 0;
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

type NaverNewsItem = {
  title?: string;
  originallink?: string;
  link?: string;
  description?: string;
  pubDate?: string; // RFC 822: "Wed, 16 Apr 2026 10:12:00 +0900"
};

type NaverNewsResponse = {
  lastBuildDate?: string;
  total?: number;
  start?: number;
  display?: number;
  items?: NaverNewsItem[];
};

function getNaverAuth() {
  // 우선순위: .env.local의 NAVER_CLIENT_* → (기존 사용 중일 수 있는) NAVER_NEWS_CLIENT_* 폴백
  const clientId = process.env.NAVER_CLIENT_ID || process.env.NAVER_NEWS_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET || process.env.NAVER_NEWS_CLIENT_SECRET;
  return { clientId, clientSecret };
}

function parseNaverNewsItems(items: NaverNewsItem[]): NewsItem[] {
  return (items || [])
    .map((it) => {
      const title = sanitizeTitle(String(it?.title ?? ""));
      const link = String(it?.originallink ?? it?.link ?? "").trim();
      const pubDateRaw = String(it?.pubDate ?? "").trim();
      const pubDate = pubDateRaw ? new Date(pubDateRaw).toISOString() : "";
      const description = sanitizeDescription(String(it?.description ?? ""));

      // source는 도메인에서 추출(네이버 응답에 별도 필드 없음)
      const source = extractSource(link);

      // description은 UI에 쓰지 않지만, 품질 점수에 활용할 여지를 남김(현재는 미사용)
      void description;

      return { title, link, pubDate, source } satisfies NewsItem;
    })
    .filter((x) => x.title && x.link && x.pubDate);
}

function withinLastDays(isoOrRfc: string, days: number): boolean {
  const t = parsePubDate(isoOrRfc);
  if (!t) return false;
  const now = Date.now();
  return now - t <= days * 24 * 60 * 60 * 1000;
}

export async function GET() {
  try {
    const { clientId, clientSecret } = getNaverAuth();
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          news: FALLBACK_NEWS,
          updatedAt: new Date().toISOString(),
          error: true,
          message: "네이버 뉴스 API 키가 설정되지 않아 기본 뉴스로 대체합니다. (.env.local: NAVER_CLIENT_ID/SECRET)",
        },
        { status: 200 }
      );
    }

    const url = new URL(NAVER_NEWS_ENDPOINT);
    url.searchParams.set("query", NAVER_QUERY);
    url.searchParams.set("display", String(NAVER_DISPLAY));
    url.searchParams.set("sort", NAVER_SORT);

    const res = await fetch(url.toString(), {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      // Next.js revalidate (weekly)
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      return NextResponse.json({
        news: FALLBACK_NEWS,
        updatedAt: new Date().toISOString(),
        error: true,
        message: `네이버 뉴스 API 호출 실패 (HTTP ${res.status})`,
      });
    }

    const data = (await res.json()) as NaverNewsResponse;
    const parsed = parseNaverNewsItems(Array.isArray(data?.items) ? data.items : []);

    const recent = parsed.filter((n) => withinLastDays(n.pubDate, RECENT_DAYS));
    const dedupedLinks = dedupeByLink(recent);
    const dedupedTitles = dedupeByTitle(dedupedLinks);
    const sorted = dedupedTitles.sort((a, b) => {
      // 최신순 우선, 동점이면 품질 점수로 보조 정렬
      const t = parsePubDate(b.pubDate) - parsePubDate(a.pubDate);
      if (t !== 0) return t;
      const s =
        titleQualityScore(b.title) +
        publisherQualityScore(b.source, b.link) -
        (titleQualityScore(a.title) + publisherQualityScore(a.source, a.link));
      if (s !== 0) return s;
      return normalizeTitleKey(a.title).localeCompare(normalizeTitleKey(b.title));
    });
    let news = sorted.slice(0, MAX_OUTPUT);

    if (news.length === 0) {
      // 7일 필터로 비어버리는 경우가 있어, 전체 후보에서 한 번 더 시도
      const fallbackPool = dedupeByTitle(dedupeByLink(parsed)).sort((a, b) => {
        const t = parsePubDate(b.pubDate) - parsePubDate(a.pubDate);
        if (t !== 0) return t;
        const s =
          titleQualityScore(b.title) +
          publisherQualityScore(b.source, b.link) -
          (titleQualityScore(a.title) + publisherQualityScore(a.source, a.link));
        if (s !== 0) return s;
        return normalizeTitleKey(a.title).localeCompare(normalizeTitleKey(b.title));
      });
      news = fallbackPool.slice(0, MAX_OUTPUT);
    }

    if (news.length === 0) {
      return NextResponse.json({
        news: FALLBACK_NEWS,
        updatedAt: new Date().toISOString(),
        error: false,
        message: "뉴스 결과가 없어 기본 공지로 대체합니다.",
      });
    }

    return NextResponse.json({
      news,
      updatedAt: new Date().toISOString(),
      error: false,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({
      news: FALLBACK_NEWS,
      updatedAt: new Date().toISOString(),
      error: true,
      message: `뉴스 API 처리 중 예외가 발생했습니다: ${msg}`,
    });
  }
}
