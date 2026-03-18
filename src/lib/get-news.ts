export interface NewsItem {
  title: string;
  source: string;
  link: string;
  pubDate: string;
}

export type GetNewsResult = { news: NewsItem[]; error: boolean; message?: string };

const FALLBACK_NEWS: NewsItem[] = [
  { title: "세종시, 데이터 기반 정책 추진", source: "연합뉴스", link: "https://www.yna.co.kr", pubDate: new Date().toISOString() },
  { title: "지자체 데이터·AI 혁신 사례", source: "전자신문", link: "https://www.etnews.com", pubDate: new Date().toISOString() },
  { title: "시민 참여와 스마트시티", source: "뉴시스", link: "https://www.newsis.com", pubDate: new Date().toISOString() },
];

/** /api/news 호출. 실패 시에도 폴백 목록 반환해 빈 화면 방지. */
export async function getNews(): Promise<GetNewsResult> {
  try {
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/news`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return { news: FALLBACK_NEWS, error: true, message: `뉴스 API 호출 실패 (HTTP ${res.status})` };
    }

    const data = await res.json();
    const news = Array.isArray(data.news) ? data.news : [];
    const message = typeof data.message === "string" ? data.message : undefined;
    const error = data.error === true;
    return { news: news.length > 0 ? news : FALLBACK_NEWS, error, message };
  } catch {
    return { news: FALLBACK_NEWS, error: true, message: "뉴스 API 호출 중 네트워크 오류" };
  }
}
