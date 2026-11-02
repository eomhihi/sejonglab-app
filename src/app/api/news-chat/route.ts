import { NextResponse } from "next/server";
import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import {
  searchSejongNewsHybrid,
  RetrievedNewsSource,
  resolveGeminiApiKey,
} from "@/lib/sejongNewsRag";

export interface ChatHistoryItem {
  role: "user" | "model" | "ai";
  content?: string;
  text?: string;
}

export interface NewsChatSourceDTO {
  title: string;
  date: string;
  press: string;
  similarity: number;
  url: string;
  category?: string;
  isLive?: boolean;
}

const SYSTEM_PROMPT = `당신은 실제 언론 보도 및 세종특별자치시 공식 보도자료 데이터를 기반으로 심층 브리핑을 제공하는 '세종랩 AI 뉴스·정책 수석 분석가'입니다. 사용자의 질문에 대해 제공된 [참고 뉴스 데이터]에 수록된 실제 기사 제목, 보도일자(YYYY-MM-DD), 언론사명, 핵심 요약 내용만을 근거로 전문적이고 입체적인 분석 리포트를 작성하세요.

[핵심 작성 원칙 — STRICT ZERO-MOCK]
1. **철저한 사실 기반 인용**: 답변의 각 핵심 단락마다 반드시 근거가 된 실제 기사의 **보도일자(YYYY-MM-DD)와 언론사명**을 명시하여 인용하세요.
2. **구체적 고유명사·수치 적시**: 제공된 기사에 등장하는 **구체적 기관명**(예: 세종테크노파크, 세종시문화관광재단, 세종시교육청, 세종도시교통공사, 행복청, 세종인재평생교육진흥원 등), **사업·정책명**(예: 기회발전특구, 이응패스, 공동캠퍼스, RISE, 시민대학 집현전, 청춘조치원, 두루타 등), **예산·면적·비율·일정 등 실제 수치**를 빠짐없이 포함하세요.
3. **환각(Hallucination) 절대 금지**: 제공된 [참고 뉴스 데이터]에 없는 허구의 예산 수치, 가짜 공고명, 추측성 사실을 절대 지어내지 마세요. 기사에 세부 수치가 명시되지 않은 항목은 "제공된 보도 범위 내에서는 구체적 수치가 확인되지 않으나, 해당 기관 공고를 통한 추가 확인이 필요합니다"라고 정직하게 안내하세요.

[답변 구조 가이드 — 3단계 심층 리포트]
사용자의 질문 도메인에 맞춰 아래 3단계 프레임워크로 명확히 구조화하여 마크다운(볼드체, 불릿 리스트)으로 가독성 높게 작성하세요:
1. **📌 [현황 및 시정 추진 배경]**: 질문 현안에 대한 세종시의 추진 경과, 시기별 정책 흐름, 핵심 배경을 실제 보도일자와 언론사를 인용하여 브리핑합니다.
2. **🔍 [핵심 기회·정책 및 세부 내용 분석]**: 기사에서 확인되는 구체적인 정책 내용, 지원 혜택/인센티브, 인프라 구축 현황, 예산/규모, 또는 주요 과제와 대책을 항목별로 심층 분석합니다.
3. **💡 [실무 활용 제언 및 유관 기관 안내]**: 기업·기관·연구자·시민 관점에서 주목해야 할 실질적 활용 포인트(공모·입찰·산학연 연계·청약/신청 체크포인트 등)와 담당 유관 기관을 명확히 제시합니다.`;

const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
];

function formatNewsContextBlock(sources: RetrievedNewsSource[]): string {
  const lines = sources.map((src, idx) => {
    return [
      `기사 ${idx + 1}. [${src.category}] ${src.title}`,
      `- 보도일자: ${src.date} | 언론사: ${src.press} | 코사인 유사도: ${(src.similarity * 100).toFixed(1)}%`,
      `- 핵심키워드: ${src.keywords.join(", ")}`,
      `- 실제 기사 요약: ${src.summary}`,
      `- 실제 원문 링크: ${src.url}`,
    ].join("\n");
  });

  return `[참고 뉴스 데이터]\n${lines.join("\n\n")}`;
}

function normalizeHistoryForGemini(history: ChatHistoryItem[]): Content[] {
  if (!Array.isArray(history) || history.length === 0) return [];

  const contents: Content[] = [];
  const recentHistory = history.slice(-8);

  for (const item of recentHistory) {
    const text = (item.content || item.text || "").trim();
    if (!text) continue;
    // 이전 턴의 오류 안내 메시지는 대화 컨텍스트에서 제외
    if (text.startsWith("질문 분석 요청 중 오류가 발생했습니다:")) continue;

    const role: "user" | "model" = item.role === "user" ? "user" : "model";

    if (contents.length === 0 && role === "model") {
      continue;
    }

    const prev = contents[contents.length - 1];
    if (prev && prev.role === role) {
      prev.parts[0].text = `${prev.parts[0].text}\n\n${text}`;
    } else {
      contents.push({
        role,
        parts: [{ text }],
      });
    }
  }

  // Gemini startChat history는 반드시 model 응답으로 끝나야 다음 sendMessage(user)와 역할이 교차됨
  while (contents.length > 0 && contents[contents.length - 1].role === "user") {
    contents.pop();
  }

  return contents;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message =
      typeof body === "object" && body !== null
        ? String(body.message || "").trim()
        : "";
    const rawHistory: ChatHistoryItem[] =
      typeof body === "object" && body !== null && Array.isArray(body.history)
        ? body.history
        : [];

    if (!message) {
      return NextResponse.json(
        {
          answer: "질문 내용을 입력해 주세요.",
          sources: [],
        },
        { status: 400 }
      );
    }

    const apiKey = (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
      resolveGeminiApiKey() ||
      ""
    ).trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          answer:
            "서버에 GEMINI_API_KEY가 설정되어 있지 않아 AI 분석 및 임베딩 검색을 수행할 수 없습니다.",
          sources: [],
          error: "MISSING_GEMINI_API_KEY",
        },
        { status: 500 }
      );
    }

    // 1. 실제 임베딩 코사인 유사도 기반 뉴스 검색 (최소 유사도 0.35 이상 상위 4건)
    const retrievedArticles = await searchSejongNewsHybrid(message, 4, 0.35);

    if (retrievedArticles.length === 0) {
      return NextResponse.json({
        answer:
          "질문하신 내용과 관련된 실제 뉴스 기사를 찾지 못했습니다. 다른 검색어나 세종시 주요 정책·현안 키워드로 다시 질문해 주세요.",
        sources: [],
      });
    }

    const newsContextBlock = formatNewsContextBlock(retrievedArticles);
    const userPromptWithContext = `${newsContextBlock}

[사용자 질문]
${message}

위 [참고 뉴스 데이터]에 포함된 실제 기사들의 보도일자, 언론사, 기사 내용을 인용하여 질문에 답변해 주세요.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const formattedHistory = normalizeHistoryForGemini(rawHistory);

    let answer = "";
    const modelErrors: string[] = [];

    for (const modelName of MODEL_CANDIDATES) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT,
        });

        if (formattedHistory.length > 0) {
          const chat = model.startChat({
            history: formattedHistory,
          });
          const result = await chat.sendMessage(userPromptWithContext);
          answer = result.response.text().trim();
        } else {
          const result = await model.generateContent(userPromptWithContext);
          answer = result.response.text().trim();
        }

        if (answer) {
          break;
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        modelErrors.push(`${modelName}: ${errMsg}`);
        console.warn(`[/api/news-chat] 모델 '${modelName}' 호출 실패:`, errMsg);
      }
    }

    if (!answer) {
      return NextResponse.json(
        {
          answer: `Gemini AI 응답 생성 중 실제 API 오류가 발생했습니다: ${modelErrors.join(" | ")}`,
          sources: [],
          error: "GEMINI_GENERATION_FAILED",
        },
        { status: 502 }
      );
    }

    const sources: NewsChatSourceDTO[] = retrievedArticles.map((item) => ({
      title: item.title,
      date: item.date,
      press: item.press,
      similarity: item.similarity,
      url: item.url,
      category: item.category,
      isLive: Boolean(item.isLive),
    }));

    return NextResponse.json({
      answer,
      sources,
    });
  } catch (error: unknown) {
    console.error("[/api/news-chat] 처리 중 예외 발생:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "알 수 없는 서버 오류가 발생했습니다.";
    return NextResponse.json(
      {
        answer: `분석 요청 처리 중 실제 서버 오류가 발생했습니다: ${errorMessage}`,
        sources: [],
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
