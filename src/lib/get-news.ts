export interface NewsItem {
  title: string;
  source: string;
  link: string;
  pubDate: string;
}

export type GetNewsResult = { news: NewsItem[]; error: boolean };

/** 네이버 뉴스 API만 사용. revalidate 3600(1시간). */
export async function getNews(): Promise<GetNewsResult> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3003";
    const res = await fetch(`${baseUrl}/api/news`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return { news: [], error: true };
    }

    const data = await res.json();
    if (data.error === true) {
      return { news: [], error: true };
    }

    const news = Array.isArray(data.news) ? data.news : [];
    return { news, error: false };
  } catch {
    return { news: [], error: true };
  }
}
