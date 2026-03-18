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
const MAX_OUTPUT = 20;

/** query 파라미터: 세종시 정책, 데이터 혁신 (네이버 검색 API 권장 쿼리) */
const SEARCH_QUERIES = ["세종시 정책", "데이터 혁신"];

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

/**
 * 네이버 검색(Search) API - 뉴스
 * 헤더: X-Naver-Client-Id, X-Naver-Client-Secret (발급받은 값 필수)
 */
async function fetchNaverNews(query: string): Promise<NewsItem[]> {
  const clientId = process.env.NAVER_NEWS_CLIENT_ID;
  const clientSecret = process.env.NAVER_NEWS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return [];
  }

  const params = new URLSearchParams({
    query,
    display: String(DISPLAY_PER_QUERY),
    sort: "date",
  });

  const res = await fetch(`${NAVER_NEWS_URL}?${params.toString()}`, {
    method: "GET",
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) return [];

  const data = await res.json();
  const items = data.items || [];

  return items.map(
    (item: { title?: string; originallink?: string; link?: string; pubDate?: string }) => {
      const link = (item.originallink || item.link || "").trim();
      return {
        title: sanitizeTitle(item.title || ""),
        source: extractSource(link),
        link,
        pubDate: item.pubDate || "",
      };
    }
  );
}

export async function GET() {
  try {
    const clientId = process.env.NAVER_NEWS_CLIENT_ID;
    const clientSecret = process.env.NAVER_NEWS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          news: [],
          updatedAt: new Date().toISOString(),
          error: true,
          message: "NAVER_NEWS_CLIENT_ID, NAVER_NEWS_CLIENT_SECRET 환경 변수를 설정해 주세요.",
        },
        { status: 200 }
      );
    }

    const merged: NewsItem[] = [];
    for (const query of SEARCH_QUERIES) {
      const batch = await fetchNaverNews(query);
      merged.push(...batch);
    }

    const deduped = dedupeByLink(merged);
    deduped.sort((a, b) => parsePubDate(b.pubDate) - parsePubDate(a.pubDate));
    const news = deduped.slice(0, MAX_OUTPUT);

    return NextResponse.json({
      news,
      updatedAt: new Date().toISOString(),
      error: false,
    });
  } catch {
    return NextResponse.json(
      { news: [], updatedAt: new Date().toISOString(), error: true },
      { status: 200 }
    );
  }
}
