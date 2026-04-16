export interface NewsItem {
  title: string;
  source: string;
  link: string;
  pubDate: string;
}

export type GetNewsResult = { news: NewsItem[]; error: boolean; message?: string };

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

/** /api/news 호출. 실패 시에도 폴백 목록 반환해 빈 화면 방지. */
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
