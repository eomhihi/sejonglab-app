import { useState, useRef, useEffect, useCallback } from "react";

export interface NewsSourceItem {
  title: string;
  date: string;
  press: string;
  similarity: number;
  url: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  sources?: NewsSourceItem[];
}

export interface ApiHistoryEntry {
  role: "user" | "model";
  content: string;
}

export interface NewsChatApiResponse {
  answer: string;
  sources: NewsSourceItem[];
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-rag-init",
    sender: "ai",
    text: "안녕하세요! 2012년 출범부터 2026년까지 15년간의 세종특별자치시 뉴스·시정 데이터를 학습한 **세종랩 AI 뉴스·정책 분석가**입니다.\n\n국회세종의사당, 대통령 제2집무실, CTX 광역급행철도, 생활권별 개발 및 조치원·면지역 균형발전 등 궁금하신 주제를 질문해 주시면 관련 보도자료 근거와 함께 시기별 흐름을 분석해 드립니다.",
    timestamp: "방금 전",
  },
];

const createMessage = (
  sender: "user" | "ai",
  text: string,
  sources?: NewsSourceItem[]
): ChatMessage => ({
  id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  sender,
  text,
  timestamp: new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }),
  sources,
});

async function requestNewsChatAnalysis(
  message: string,
  history: ApiHistoryEntry[]
): Promise<NewsChatApiResponse> {
  const response = await fetch("/api/news-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    throw new Error(`서버 응답 오류 (HTTP ${response.status})`);
  }

  const data = await response.json();
  return {
    answer: data.answer || "분석 결과를 생성할 수 없습니다.",
    sources: Array.isArray(data.sources) ? data.sources : [],
  };
}

export function useSejongChat() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping, scrollToBottom]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText ?? input).trim();
    if (!textToSend || isTyping) return;

    const historyPayload: ApiHistoryEntry[] = messages
      .filter((m) => m.id !== "welcome-rag-init")
      .map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        content: m.text,
      }));

    const userMsg = createMessage("user", textToSend);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const { answer, sources } = await requestNewsChatAnalysis(
        textToSend,
        historyPayload
      );
      setMessages((prev) => [...prev, createMessage("ai", answer, sources)]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "네트워크 통신 실패";
      setMessages((prev) => [
        ...prev,
        createMessage(
          "ai",
          `요청 처리 중 오류가 발생했습니다: ${errorMessage}`
        ),
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
    setInput("");
  }, []);

  return {
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    isTyping,
    handleSend,
    handleReset,
    messagesEndRef,
  };
}
