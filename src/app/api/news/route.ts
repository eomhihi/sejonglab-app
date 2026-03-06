import { NextResponse } from "next/server";

export interface NewsItem {
  title: string;
  source: string;
  link: string;
  pubDate: string;
}

const KEYWORDS = ["데이터 기반 정책", "AI 행정 혁신"];

async function fetchNaverNews(query: string): Promise<NewsItem[]> {
  const clientId = process.env.NAVER_NEWS_CLIENT_ID;
  const clientSecret = process.env.NAVER_NEWS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return [];
  }

  try {
    const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=5&sort=date`;
    const res = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.items.map((item: { title: string; originallink: string; link: string; pubDate: string }) => ({
      title: item.title.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&"),
      source: extractSource(item.originallink || item.link),
      link: item.originallink || item.link,
      pubDate: item.pubDate,
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
      const res = await fetch(feedUrl, { next: { revalidate: 86400 } });
      if (!res.ok) continue;

      const xml = await res.text();
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (const item of items.slice(0, 3)) {
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

  for (const keyword of KEYWORDS) {
    const news = await fetchNaverNews(keyword);
    allNews.push(...news);
  }

  if (allNews.length < 3) {
    const rssNews = await fetchRssNews();
    allNews.push(...rssNews);
  }

  if (allNews.length === 0) {
    allNews = FALLBACK_NEWS;
  }

  const uniqueNews = allNews.filter(
    (item, index, self) => self.findIndex((t) => t.title === item.title) === index
  );

  return NextResponse.json({
    news: uniqueNews.slice(0, 5),
    updatedAt: new Date().toISOString(),
  });
}
