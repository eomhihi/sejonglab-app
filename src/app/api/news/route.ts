import { NextResponse } from "next/server";

export interface NewsItem {
  title: string;
  source: string;
  link: string;
  pubDate: string;
}

/** 데이터 기반 시민 참여 독려: (주제) + (범위) 조합으로 검색 */
const KEYWORDS_A = ["데이터 행정", "스마트시티", "디지털 트윈", "리빙랩", "시민 참여 정책"];
const KEYWORDS_B = ["세종시", "글로벌 사례", "국내 성과"];
const RELEVANCE_WORDS = ["데이터", "시민", "정책", "혁신"];
const REVALIDATE_SECONDS = 604800;
const MAX_AGE_DAYS = 7;
const MAX_ITEMS = 10;
const NUM_SEARCH_QUERIES = 5;

/** A·B에서 무작위 조합으로 검색 쿼리 n개 생성 */
function getRandomSearchQueries(n: number): string[] {
  const queries: string[] = [];
  const used = new Set<string>();
  while (queries.length < n) {
    const a = KEYWORDS_A[Math.floor(Math.random() * KEYWORDS_A.length)];
    const b = KEYWORDS_B[Math.floor(Math.random() * KEYWORDS_B.length)];
    const q = `${a} ${b}`;
    if (!used.has(q)) {
      used.add(q);
      queries.push(q);
    }
    if (used.size >= KEYWORDS_A.length * KEYWORDS_B.length) break;
  }
  return queries.length > 0 ? queries : [`${KEYWORDS_A[0]} ${KEYWORDS_B[0]}`];
}

/** 제목·본문에 포함된 RELEVANCE_WORDS 개수 (최소 2개 이상 우선) */
function relevanceScore(title: string, description: string = ""): number {
  const text = `${title} ${description}`;
  return RELEVANCE_WORDS.filter((w) => text.includes(w)).length;
}

function parsePubDate(pubDate: string): number {
  const d = new Date(pubDate);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

/** 제목·링크 기준 중복 제거 (먼저 나온 항목 유지) */
function dedupeByTitleAndLink<T extends { title: string; link: string }>(items: T[]): T[] {
  const seenTitles = new Set<string>();
  const seenLinks = new Set<string>();
  return items.filter((item) => {
    const titleNorm = item.title.trim().toLowerCase();
    const linkNorm = (item.link || "").trim().toLowerCase();
    if (seenTitles.has(titleNorm) || seenLinks.has(linkNorm)) return false;
    seenTitles.add(titleNorm);
    seenLinks.add(linkNorm);
    return true;
  });
}

type NewsItemInternal = NewsItem & { description?: string };

/** 최근 7일 이내 필터, 관련도(데이터/시민/정책/혁신 2개 이상 우선) → pubDate 내림차순, 최대 10건 */
function filterSortAndLimit(items: NewsItemInternal[]): NewsItem[] {
  const now = Date.now();
  const cutoff = now - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  const withScore = items
    .filter((item) => parsePubDate(item.pubDate) >= cutoff)
    .map((item) => ({ item, score: relevanceScore(item.title, item.description ?? "") }));
  withScore.sort((a, b) => (b.score !== a.score ? b.score - a.score : parsePubDate(b.item.pubDate) - parsePubDate(a.item.pubDate)));

  return withScore.slice(0, MAX_ITEMS).map(({ item }) => ({
    title: item.title,
    source: item.source,
    link: item.link,
    pubDate: item.pubDate,
  }));
}

async function fetchNaverNews(query: string): Promise<NewsItemInternal[]> {
  const clientId = process.env.NAVER_NEWS_CLIENT_ID;
  const clientSecret = process.env.NAVER_NEWS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return [];
  }

  try {
    const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=10&sort=date`;
    const res = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return (data.items || []).map((item: { title: string; originallink: string; link: string; pubDate: string; description?: string }) => {
      const title = (item.title || "").replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
      const description = (item.description || "").replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
      return {
        title,
        source: extractSource(item.originallink || item.link),
        link: item.originallink || item.link || "",
        pubDate: item.pubDate || "",
        description,
      };
    });
  } catch {
    return [];
  }
}

function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    const sourceMappings: Record<string, string> = {
      "www.chosun.com": "조선일보",
      "www.donga.com": "동아일보",
      "www.hani.co.kr": "한겨레",
      "www.khan.co.kr": "경향신문",
      "www.joongang.co.kr": "중앙일보",
      "news.kbs.co.kr": "KBS",
      "news.sbs.co.kr": "SBS",
      "www.ytn.co.kr": "YTN",
      "www.mk.co.kr": "매일경제",
      "www.hankyung.com": "한국경제",
      "www.yna.co.kr": "연합뉴스",
      "www.newsis.com": "뉴시스",
      "www.etnews.com": "전자신문",
      "zdnet.co.kr": "ZDNet",
      "www.bloter.net": "블로터",
    };
    return sourceMappings[hostname] || hostname.replace("www.", "").split(".")[0];
  } catch {
    return "뉴스";
  }
}

async function fetchRssNews(): Promise<NewsItemInternal[]> {
  const feeds = [
    "https://www.etnews.com/RSS07.xml",
    "https://rss.hankyung.com/feed/it.xml",
  ];

  const allNews: NewsItemInternal[] = [];
  const relevanceInTitle = (t: string) => RELEVANCE_WORDS.filter((w) => t.includes(w)).length;

  for (const feedUrl of feeds) {
    try {
      const res = await fetch(feedUrl, { next: { revalidate: REVALIDATE_SECONDS } });
      if (!res.ok) continue;

      const xml = await res.text();
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (const item of items.slice(0, 5)) {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
          || item.match(/<title>(.*?)<\/title>/)?.[1] || "";
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
        const cleanTitle = title.replace(/<[^>]*>/g, "");

        if (relevanceInTitle(cleanTitle) >= 2 || cleanTitle.includes("데이터") || cleanTitle.includes("AI") || cleanTitle.includes("디지털") || cleanTitle.includes("스마트")) {
          allNews.push({
            title: cleanTitle,
            source: extractSource(link),
            link,
            pubDate,
            description: "",
          });
        }
      }
    } catch {
      continue;
    }
  }

  return allNews;
}

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
  let allNews: NewsItemInternal[] = [];
  const queries = getRandomSearchQueries(NUM_SEARCH_QUERIES);

  try {
    for (const query of queries) {
      const news = await fetchNaverNews(query);
      allNews.push(...news);
    }

    if (allNews.length < 5) {
      const rssNews = await fetchRssNews();
      allNews.push(...rssNews);
    }

    const deduped = dedupeByTitleAndLink(allNews);
    const filtered = filterSortAndLimit(deduped);

    if (filtered.length > 0) {
      return NextResponse.json({
        news: filtered,
        updatedAt: new Date().toISOString(),
        error: false,
      });
    }

    // 7일 이내 기사가 없으면 폴백 사용 (오래된 폴백도 정렬·제한 적용)
    const fallbackInternal: NewsItemInternal[] = FALLBACK_NEWS.map((n) => ({ ...n, description: "" }));
    const fallbackProcessed = filterSortAndLimit(dedupeByTitleAndLink(fallbackInternal));
    if (fallbackProcessed.length > 0) {
      return NextResponse.json({
        news: fallbackProcessed,
        updatedAt: new Date().toISOString(),
        error: false,
      });
    }

    // 폴백도 7일 필터 통과 못 하면 최신순 10개만
    const fallbackSorted = dedupeByTitleAndLink(FALLBACK_NEWS)
      .sort((a, b) => parsePubDate(b.pubDate) - parsePubDate(a.pubDate))
      .slice(0, MAX_ITEMS);
    return NextResponse.json({
      news: fallbackSorted,
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
