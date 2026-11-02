"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageSquare,
  X,
  RotateCcw,
  Send,
  Sparkles,
  ExternalLink,
  Newspaper,
  Bot,
  User,
  Database,
  ArrowUpRight,
} from "lucide-react";

export interface NewsSource {
  title: string;
  date: string;
  press: string;
  similarity: number;
  url: string;
  category?: string;
  isLive?: boolean;
}

/**
 * 보도일자(YYYY-MM-DD)가 현재 시각 기준 최근 7일 이내인지 판별
 */
function isPublishedWithinLast7Days(dateStr: string): boolean {
  if (!dateStr) return false;
  const pubTime = new Date(`${dateStr.trim()}T00:00:00+09:00`).getTime();
  if (Number.isNaN(pubTime)) return false;
  const nowTime = Date.now();
  const diffDays = (nowTime - pubTime) / (1000 * 60 * 60 * 24);
  return diffDays >= -1 && diffDays <= 7;
}

export interface ChatHistoryTurn {
  role: "user" | "model";
  content: string;
}

export interface ChatMessageItem {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
  sources?: NewsSource[];
}

export interface DomainCategoryTab {
  id: string;
  label: string;
  questions: string[];
}

const DOMAIN_CATEGORY_TABS: DomainCategoryTab[] = [
  {
    id: "urban-transit-commerce",
    label: "🚆 도시·교통·상권",
    questions: [
      "국회세종의사당 건립 및 CTX 광역급행철도 추진 경과 알려줘",
      "세종시 상가 공실 해소를 위한 용도변경 완화 및 상권 활성화 대책은?",
    ],
  },
  {
    id: "policy-history-10yr",
    label: "📊 10년 정책 변천사",
    questions: [
      "이응패스 도입까지 지난 10년간 세종시 대중교통 정책 변화 과정은?",
      "조치원 및 읍·면 지역 균형발전과 도시재생 사업의 핵심 성과는?",
    ],
  },
  {
    id: "housing-edu-welfare",
    label: "🏠 정주·교육·복지",
    questions: [
      "4·5생활권 학교 신설 계획 및 과밀학급 해소 대책은?",
      "세종시 청년 정착 및 신혼부부·다자녀 주거 지원 정책 알려줘",
    ],
  },
  {
    id: "biz-bidding-opportunity",
    label: "💼 기업·사업기회",
    questions: [
      "미디어·영상 기업이 참여할 만한 세종시 문화·축제 및 디지털 콘텐츠 사업 기회는?",
      "첨단·로봇 기업이 세종시 산단·기회발전특구 이전 시 받는 혜택은?",
    ],
  },
  {
    id: "univ-r-and-d-lifelong",
    label: "🎓 대학·산학연",
    questions: [
      "세종시 관내 대학 연계 산학협력 추진 현황은?",
      "세종시 평생교육 및 직업교육 관련 주요 정책과 신규 수요는?",
    ],
  },
];

const INITIAL_WELCOME_MESSAGE: ChatMessageItem = {
  id: "sejong-rag-welcome",
  role: "ai",
  content:
    "안녕하세요. 2012년부터 2026년까지 15년간의 세종특별자치시 뉴스 및 시정 데이터를 학습한 **세종랩 AI 뉴스·정책 분석가**입니다. 궁금하신 질문을 입력하거나 아래 카테고리 탭에서 추천 질문을 선택해 주세요.",
  timestamp: "방금 전",
};

/**
 * 볼드체(**텍스트**) 인라인 파서
 */
function renderInlineBold(text: string): React.ReactNode[] {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  return segments.map((seg, idx) => {
    if (seg.startsWith("**") && seg.endsWith("**") && seg.length > 4) {
      return (
        <strong key={idx} className="font-bold text-[#002d56]">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{seg}</React.Fragment>;
  });
}

/**
 * 가독성 높은 마크다운(단락 구분, 헤더, 볼드체, 불릿 리스트, 번호 리스트) 렌더러
 */
function MarkdownAnswerBody({ content }: { content: string }) {
  const paragraphs = content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3 text-[13.5px] leading-[1.7] text-[#1e293b] tracking-[-0.01em]">
      {paragraphs.map((block, bIdx) => {
        if (/^-{3,}$/.test(block.trim())) {
          return <hr key={bIdx} className="border-slate-200/90 my-2" />;
        }
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

        // 단일/다중 라인이 모두 불릿 또는 번호 리스트인지 확인
        const isListBlock =
          lines.length > 0 &&
          lines.every((l) => /^([-*•]|\d+\.)\s+/.test(l));

        if (isListBlock) {
          return (
            <ul
              key={bIdx}
              className="space-y-1.5 pl-1 border-l-2 border-[#124559]/25 ml-0.5"
            >
              {lines.map((line, lIdx) => {
                const cleaned = line.replace(/^([-*•]|\d+\.)\s+/, "");
                return (
                  <li
                    key={lIdx}
                    className="flex items-start gap-2 pl-2 text-[#1e293b]"
                  >
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#124559] shrink-0" />
                    <span className="flex-1">{renderInlineBold(cleaned)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // 마크다운 소제목 (#, ##, ###) 처리
        if (lines.length === 1 && /^#{1,3}\s+/.test(lines[0])) {
          const headingText = lines[0].replace(/^#{1,3}\s+/, "");
          return (
            <h4
              key={bIdx}
              className="text-sm font-extrabold text-[#002d56] pt-1 pb-0.5 border-b border-slate-200/80"
            >
              {renderInlineBold(headingText)}
            </h4>
          );
        }

        // 일반 단락 + 혼합 불릿 처리
        return (
          <div key={bIdx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              if (/^#{1,3}\s+/.test(line)) {
                return (
                  <h4
                    key={lIdx}
                    className="text-sm font-extrabold text-[#002d56] pt-1"
                  >
                    {renderInlineBold(line.replace(/^#{1,3}\s+/, ""))}
                  </h4>
                );
              }
              if (/^([-*•]|\d+\.)\s+/.test(line)) {
                const cleaned = line.replace(/^([-*•]|\d+\.)\s+/, "");
                return (
                  <div
                    key={lIdx}
                    className="flex items-start gap-2 pl-2 text-[#1e293b]"
                  >
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#124559] shrink-0" />
                    <span className="flex-1">{renderInlineBold(cleaned)}</span>
                  </div>
                );
              }
              return (
                <p key={lIdx} className="text-[#1e293b]">
                  {renderInlineBold(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function SejongNewsChat() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    INITIAL_WELCOME_MESSAGE,
  ]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    DOMAIN_CATEGORY_TABS[0].id
  );
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeCategory =
    DOMAIN_CATEGORY_TABS.find((tab) => tab.id === activeCategoryId) ||
    DOMAIN_CATEGORY_TABS[0];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading, scrollToBottom]);

  /**
   * 사용자의 입력값(input) 또는 클릭한 추천 키워드(customQuery)를
   * 어떠한 변조나 하드코딩 덮어쓰기 없이 그대로 POST /api/news-chat에 전송
   */
  const sendQuery = useCallback(
    async (rawQuery?: string) => {
      const query = (typeof rawQuery === "string" ? rawQuery : input).trim();
      if (!query || isLoading) return;

      // 이전 대화 히스토리 구성 (초기 환영 인사 및 실패한 턴 제외)
      const validHistory: ChatHistoryTurn[] = [];
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (msg.id === INITIAL_WELCOME_MESSAGE.id || msg.id.startsWith("error-")) {
          continue;
        }
        // 직후 메시지가 에러 메시지인 user 질문은 히스토리에서 제외
        const nextMsg = messages[i + 1];
        if (msg.role === "user" && nextMsg && nextMsg.id.startsWith("error-")) {
          continue;
        }
        validHistory.push({
          role: msg.role === "user" ? "user" : "model",
          content: msg.content,
        });
      }
      const history = validHistory;

      const nowStr = new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const userMessage: ChatMessageItem = {
        id: `user-${Date.now()}`,
        role: "user",
        content: query,
        timestamp: nowStr,
      };

      setMessages((prev) => [...prev, userMessage]);
      if (typeof rawQuery !== "string") {
        setInput("");
      }
      setIsLoading(true);

      try {
        const response = await fetch("/api/news-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: query, history }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const serverErrorMsg =
            data && typeof data.answer === "string" && data.answer.trim()
              ? data.answer.trim()
              : `API 요청 실패 (HTTP ${response.status})`;
          throw new Error(serverErrorMsg);
        }

        const aiAnswer: string =
          data && typeof data.answer === "string" && data.answer.trim()
            ? data.answer.trim()
            : "관련된 실제 뉴스 기사를 찾지 못했습니다.";
        const aiSources: NewsSource[] =
          data && Array.isArray(data.sources) ? data.sources : [];

        const aiMessage: ChatMessageItem = {
          id: `ai-${Date.now()}`,
          role: "ai",
          content: aiAnswer,
          timestamp: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sources: aiSources,
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err: unknown) {
        const errMsg =
          err instanceof Error ? err.message : "네트워크 오류가 발생했습니다.";
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "ai",
            content: `질문 분석 요청 중 오류가 발생했습니다: ${errMsg}`,
            timestamp: new Date().toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages]
  );

  const handleReset = useCallback(() => {
    setMessages([INITIAL_WELCOME_MESSAGE]);
    setInput("");
  }, []);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] pointer-events-auto flex flex-col items-end gap-2.5 font-sans">
      {!isOpen && (
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-[#002d56] text-[#f0f9ff] text-xs font-semibold rounded-xl shadow-lg border border-[#124559]">
          <Sparkles className="w-3.5 h-3.5 text-sky-300 shrink-0" />
          <span>세종랩 15년 시정·뉴스 AI 분석가</span>
        </div>
      )}

      {/* Floating Toggle Button (모바일에서 대화창이 열리면 상단 닫기 버튼과 겹치지 않도록 숨김) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative group items-center justify-center p-3.5 sm:p-4 rounded-xl shadow-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#002d56]/30 pointer-events-auto ${
          isOpen
            ? "hidden sm:flex bg-[#1e293b] text-white"
            : "flex bg-[#002d56] hover:bg-[#124559] text-white"
        }`}
        aria-label={isOpen ? "챗봇 닫기" : "세종시 뉴스 AI 챗봇 열기"}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-400" />
            </span>
          </div>
        )}
      </button>

      {/* Swiss International Style Dialog Panel (모바일/데스크톱 반응형 최적화) */}
      {isOpen && (
        <div
          className="fixed inset-x-2.5 bottom-2.5 top-[max(0.75rem,env(safe-area-inset-top))] sm:inset-auto sm:bottom-24 sm:right-6 z-[9999] pointer-events-auto w-auto sm:w-[540px] h-[calc(100dvh-1.25rem)] sm:h-[680px] max-h-[calc(100dvh-1.25rem)] sm:max-h-[calc(100dvh-7.5rem)] bg-white border border-slate-300 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          role="dialog"
          aria-label="세종랩 AI 뉴스·정책 분석 대화창"
        >
          {/* Header: Deep Navy (#002d56) & Deep Teal (#124559) Swiss Grid Header */}
          <header className="bg-[#002d56] text-white px-3.5 py-3 sm:px-5 sm:py-4 border-b border-[#124559] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#124559] border border-sky-400/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-[#f0f9ff]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="font-bold text-[13.5px] sm:text-[15px] tracking-tight text-white truncate">
                    세종랩 AI 뉴스·정책 분석가
                  </h2>
                  <span className="hidden xs:inline-flex sm:inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#124559] text-[#f0f9ff] border border-sky-300/30 shrink-0">
                    <Database className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> 2012–2026 RAG
                  </span>
                </div>
                <p className="text-[10.5px] sm:text-[11px] text-sky-100/80 truncate mt-0.5">
                  AI Policy Analyst · 세종시 뉴스 빅데이터 분석 엔진
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                title="대화 초기화"
                aria-label="대화 초기화"
                className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-[#f0f9ff] bg-[#124559]/80 hover:bg-[#124559] rounded-xl border border-white/15 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">초기화</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="닫기"
                aria-label="닫기"
                className="p-1.5 text-sky-100/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Message Stream Area */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-5 space-y-4 sm:space-y-5 bg-[#f0f9ff]/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 sm:gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.role === "user"
                      ? "bg-[#002d56] text-white"
                      : "bg-[#1e293b] text-[#f0f9ff] border border-[#124559]"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </div>

                {/* Bubble & Sources Container */}
                <div
                  className={`max-w-[89%] sm:max-w-[87%] min-w-0 space-y-2.5 sm:space-y-3 ${
                    msg.role === "user"
                      ? "items-end text-right"
                      : "items-start text-left"
                  }`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`p-3 sm:p-4 rounded-xl border break-words ${
                      msg.role === "user"
                        ? "bg-[#002d56] text-white border-[#002d56] text-[13px] sm:text-sm leading-relaxed shadow-sm"
                        : "bg-white text-[#1e293b] border-slate-200 shadow-sm"
                    }`}
                  >
                    {msg.role === "ai" ? (
                      <MarkdownAnswerBody content={msg.content} />
                    ) : (
                      <p className="whitespace-pre-line text-left">
                        {msg.content}
                      </p>
                    )}
                  </div>

                  {/* [참고한 세종시 15년 뉴스 출처] Grid Section */}
                  {msg.role === "ai" &&
                    Array.isArray(msg.sources) &&
                    msg.sources.length > 0 && (
                      <section
                        aria-label="참고한 세종시 15년 뉴스 출처"
                        className="w-full bg-[#f0f9ff] border border-[#124559]/25 rounded-xl p-2.5 sm:p-3.5 space-y-2 sm:space-y-2.5 text-left"
                      >
                        <div className="flex items-center justify-between gap-1 border-b border-[#124559]/15 pb-1.5 sm:pb-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Newspaper className="w-3.5 h-3.5 text-[#002d56] shrink-0" />
                            <span className="text-[11px] sm:text-xs font-extrabold tracking-tight text-[#002d56] truncate">
                              [참고한 세종시 15년 뉴스 출처]
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-md bg-[#124559] text-[#f0f9ff] shrink-0">
                            상위 {msg.sources.length}건 매칭
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.sources.map((src, sIdx) => {
                            const scorePercent =
                              src.similarity <= 1
                                ? `${(src.similarity * 100).toFixed(1)}%`
                                : `${src.similarity.toFixed(1)}%`;
                            const isRecent7Days = isPublishedWithinLast7Days(src.date);

                            return (
                              <a
                                key={`${msg.id}-source-${sIdx}`}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col justify-between p-2.5 bg-white hover:bg-[#002d56]/[0.03] border border-slate-200/90 hover:border-[#124559] rounded-xl transition-all"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between gap-1.5">
                                    <div className="flex items-center gap-1 min-w-0">
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#f0f9ff] text-[#124559] border border-[#124559]/20 truncate">
                                        {src.press}
                                      </span>
                                      {isRecent7Days && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight bg-amber-50 text-amber-700 border border-amber-300/80 shrink-0">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                          최신
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] font-mono font-semibold text-[#002d56] bg-sky-100/80 px-1.5 py-0.5 rounded shrink-0">
                                      연관도 {scorePercent}
                                    </span>
                                  </div>
                                  <p className="text-xs font-bold text-[#1e293b] group-hover:text-[#002d56] line-clamp-2 leading-snug pt-0.5">
                                    {src.title}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500">
                                  <span className="font-mono">{src.date}</span>
                                  <span className="inline-flex items-center gap-0.5 font-semibold text-[#124559] group-hover:text-[#002d56]">
                                    원문 <ArrowUpRight className="w-3 h-3" />
                                  </span>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </section>
                    )}

                  <span className="text-[10px] font-mono text-slate-400 block px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Skeleton Loading State */}
            {isLoading && (
              <div
                className="flex items-start gap-2 sm:gap-3"
                aria-live="polite"
                aria-busy="true"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#1e293b] text-[#f0f9ff] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
                </div>
                <div className="flex-1 max-w-[89%] sm:max-w-[87%] bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm space-y-2.5 sm:space-y-3">
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-[#002d56]">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#124559] animate-ping shrink-0" />
                    <span>
                      지난 15년간의 세종시 뉴스 DB에서 관련 기사를 분석 중입니다...
                    </span>
                  </div>
                  <div className="space-y-2 animate-pulse">
                    <div className="h-3 bg-[#f0f9ff] border border-sky-100 rounded-md w-11/12" />
                    <div className="h-3 bg-[#f0f9ff] border border-sky-100 rounded-md w-full" />
                    <div className="h-3 bg-[#f0f9ff] border border-sky-100 rounded-md w-4/5" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 animate-pulse">
                    <div className="h-11 sm:h-12 bg-slate-100 rounded-xl" />
                    <div className="hidden sm:block h-12 bg-slate-100 rounded-xl" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 5-Category Domain Tabs & Recommended Question Chips (Swiss Grid Bar) */}
          <div className="px-3 py-2.5 sm:px-4 sm:py-3 bg-[#f0f9ff] border-t border-slate-200 shrink-0 space-y-2">
            <div className="flex items-center">
              <span className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#002d56] flex items-center gap-1">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#124559] shrink-0" /> 분야별 추천 질문
              </span>
            </div>

            {/* 5 Category Pill Buttons */}
            <div
              className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar"
              role="tablist"
              aria-label="세종시 핵심 분석 도메인 카테고리"
            >
              {DOMAIN_CATEGORY_TABS.map((tab) => {
                const isSelected = tab.id === activeCategory.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveCategoryId(tab.id)}
                    className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10.5px] sm:text-[11px] font-bold transition-all shrink-0 border ${
                      isSelected
                        ? "bg-[#002d56] text-white border-[#002d56] shadow-2xs"
                        : "bg-white text-[#1e293b] border-slate-300 hover:border-[#124559] hover:text-[#002d56]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Active Category Question Chips */}
            <div className="flex flex-col gap-1.5">
              {activeCategory.questions.map((qText, idx) => (
                <button
                  key={`${activeCategory.id}-q-${idx}`}
                  type="button"
                  disabled={isLoading}
                  onClick={() => sendQuery(qText)}
                  className="w-full text-left px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white hover:bg-[#002d56] text-[#1e293b] hover:text-white disabled:opacity-50 border border-[#124559]/30 rounded-xl text-[11.5px] sm:text-xs font-semibold transition-colors shadow-2xs flex items-center justify-between gap-2 group"
                >
                  <span className="line-clamp-1 sm:truncate">{qText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#124559] group-hover:text-sky-300 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Input Form (모바일 Safe Area 대응 및 iOS 자동 줌 방지) */}
          <div className="p-2.5 sm:p-3.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendQuery();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="세종시 시정·교통·산업 이슈 입력..."
                disabled={isLoading}
                className="flex-1 min-w-0 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-[#f0f9ff]/60 border border-slate-300 focus:border-[#002d56] focus:bg-white rounded-xl text-[16px] sm:text-sm text-[#1e293b] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002d56]/20 transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-3.5 py-2.5 sm:px-4 sm:py-2.5 bg-[#002d56] hover:bg-[#124559] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shrink-0"
                aria-label="질문 전송"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">분석 요청</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
