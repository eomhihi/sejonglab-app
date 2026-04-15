import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export interface NewsItem {
  title: string;
  source: string;
  link: string;
  pubDate: string;
}

// Google News RSS (KR/ko)
const GOOGLE_NEWS_RSS_URL =
  "https://news.google.com/rss/search?q=%EB%8D%B0%EC%9D%B4%ED%84%B0%ED%98%81%EC%8B%A0%20OR%20%EC%A0%95%EC%B1%85%EB%B3%80%ED%99%94&hl=ko&gl=KR&ceid=KR:ko";

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

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  source?: { "#text"?: string; "@_url"?: string } | string;
};

function parseGoogleNewsRss(xml: string): NewsItem[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    parseTagValue: false,
    trimValues: true,
  });

  const parsed = parser.parse(xml) as any;
  const itemsRaw = parsed?.rss?.channel?.item ?? [];
  const items: RssItem[] = Array.isArray(itemsRaw) ? itemsRaw : [itemsRaw];

  return items
    .map((it) => {
      const title = sanitizeTitle(String(it?.title ?? ""));
      const link = String(it?.link ?? "").trim();
      const pubDate = String(it?.pubDate ?? "").trim();
      const sourceText =
        typeof it?.source === "string"
          ? it.source
          : typeof it?.source?.["#text"] === "string"
            ? it.source["#text"]
            : "";

      return {
        title,
        link,
        pubDate: pubDate ? new Date(pubDate).toISOString() : "",
        source: sourceText?.trim() ? sourceText.trim() : extractSource(link),
      } satisfies NewsItem;
    })
    .filter((x) => x.title && x.link);
}

function withinLastDays(isoOrRfc: string, days: number): boolean {
  const t = parsePubDate(isoOrRfc);
  if (!t) return false;
  const now = Date.now();
  return now - t <= days * 24 * 60 * 60 * 1000;
}

export async function GET() {
  try {
    const res = await fetch(GOOGLE_NEWS_RSS_URL, {
      // Next.js revalidate (weekly)
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      return NextResponse.json({
        news: FALLBACK_NEWS,
        updatedAt: new Date().toISOString(),
        error: true,
        message: `Google News RSS 호출 실패 (HTTP ${res.status})`,
      });
    }

    const xml = await res.text();
    const parsed = parseGoogleNewsRss(xml);

    const recent = parsed.filter((n) => withinLastDays(n.pubDate, RECENT_DAYS));
    const deduped = dedupeByLink(recent);
    const sorted = deduped.sort((a, b) => parsePubDate(b.pubDate) - parsePubDate(a.pubDate));
    const news = sorted.slice(0, MAX_OUTPUT);

    if (news.length === 0) {
      return NextResponse.json({
        news: FALLBACK_NEWS,
        updatedAt: new Date().toISOString(),
        error: false,
        message: "최근 7일 이내 뉴스가 없어 기본 공지로 대체합니다.",
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
