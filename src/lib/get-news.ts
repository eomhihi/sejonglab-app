export interface NewsItem {
  title: string;
  source: string;
  link: string;
  pubDate: string;
}

export type GetNewsResult = { news: NewsItem[]; error: boolean; message?: string };

/** /api/news 호출. 가짜 폴백 뉴스 없이 실제 수집 결과와 투명한 상태 메시지만 반환. */
export async function getNews(): Promise<GetNewsResult> {
  try {
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/news`, {
      // 서버에서 주 1회 갱신되도록 API 응답 캐시를 존중
      next: { revalidate: 604800 },
    });

    if (!res.ok) {
      return { news: [], error: true, message: `뉴스 API 호출 실패 (HTTP ${res.status})` };
    }

    const data = await res.json();
    const news = Array.isArray(data.news) ? data.news : [];
    const message = typeof data.message === "string" ? data.message : undefined;
    const error = data.error === true;
    return { news, error, message };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "네트워크 오류";
    return { news: [], error: true, message: `뉴스 API 호출 중 오류: ${errMsg}` };
  }
}
