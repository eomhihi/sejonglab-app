import { NextResponse } from "next/server";

export interface NewsItem {
  title: string;
  source: string;
  link: string;
  pubDate: string;
}

const KEYWORDS = ["데이터 기반 정책", "AI 행정 혁신"];
const REVALIDATE_SECONDS = 604800; // 1주일
const MAX_AGE_DAYS = 7;
const MAX_ITEMS = 10;

function parsePubDate(pubDate: string): number {
  const d = new Date(pubDate);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

/** 제목·링크 기준 중복 제거 (먼저 나온 항목 유지) */
function dedupeByTitleAndLink(items: NewsItem[]): NewsItem[] {
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

/** 최근 7일 이내만 필터, pubDate 내림차순, 최대 10건 */
function filterSortAndLimit(items: NewsItem[]): NewsItem[] {
  const now = Date.now();
  const cutoff = now - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  return items
    .filter((item) => parsePubDate(item.pubDate) >= cutoff)
    .sort((a, b) => parsePubDate(b.pubDate) - parsePubDate(a.pubDate))
    .slice(0, MAX_ITEMS);
}

async function fetchNaverNews(query: string): Promise<NewsItem[]> {
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
    return (data.items || []).map((item: { title: string; originallink: string; link: string; pubDate: string }) => ({
      title: (item.title || "").replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&"),
      source: extractSource(item.originallink || item.link),
      link: item.originallink || item.link || "",
      pubDate: item.pubDate || "",
    }));
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

async function fetchRssNews(): Promise<NewsItem[]> {
  const feeds = [
    "https://www.etnews.com/RSS07.xml",
    "https://rss.hankyung.com/feed/it.xml",
  ];

  const allNews: NewsItem[] = [];

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

        if (title.includes("데이터") || title.includes("AI") || title.includes("디지털") || title.includes("스마트")) {
          allNews.push({
            title: title.replace(/<[^>]*>/g, ""),
            source: extractSource(link),
            link,
            pubDate,
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
  let allNews: NewsItem[] = [];

  try {
    for (const keyword of KEYWORDS) {
      const news = await fetchNaverNews(keyword);
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
    const fallbackProcessed = filterSortAndLimit(dedupeByTitleAndLink(FALLBACK_NEWS));
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
