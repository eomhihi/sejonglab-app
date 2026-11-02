import { Bot, User, ExternalLink, Newspaper, Compass } from "lucide-react";
import { RefObject } from "react";
import { ChatMessage } from "./useSejongChat";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
  onSend: (text: string) => void;
}

const ARCHIVE_QUERY_SUGGESTIONS = [
  "국회세종의사당과 대통령 제2집무실 추진 경과와 전망은?",
  "CTX 충청권 광역급행철도 노선과 개통 효과 분석해줘",
  "조치원읍·면지역 균형발전 및 스마트 국가산단 현황은?",
  "세종 지방법원 설치 및 공동캠퍼스 개교 의미 알려줘",
];

function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export function ChatMessageList({
  messages,
  isTyping,
  messagesEndRef,
  onSend,
}: ChatMessageListProps) {
  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === "user"
                  ? "bg-sejong-blue text-white"
                  : "bg-slate-800 text-sky-400 border border-slate-700"
              }`}
            >
              {msg.sender === "user" ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            <div
              className={`max-w-[88%] space-y-2 ${
                msg.sender === "user"
                  ? "items-end text-right"
                  : "items-start text-left"
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line relative ${
                  msg.sender === "user"
                    ? "bg-sejong-blue text-white rounded-tr-none shadow-md"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-sm"
                }`}
              >
                {msg.sender === "ai"
                  ? renderFormattedText(msg.text)
                  : msg.text}
              </div>

              {msg.sender === "ai" &&
                Array.isArray(msg.sources) &&
                msg.sources.length > 0 && (
                  <div className="bg-slate-100/90 border border-slate-200/90 rounded-xl p-3 space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <Newspaper className="w-3.5 h-3.5 text-sejong-blue" />
                        참고 뉴스·시정 데이터 ({msg.sources.length}건)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        하이브리드 유사도순
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {msg.sources.map((src, sIdx) => (
                        <li
                          key={`${msg.id}-src-${sIdx}`}
                          className="bg-white rounded-lg p-2 border border-slate-200/70 hover:border-sejong-blue/40 transition-colors"
                        >
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-medium text-slate-800 group-hover:text-sejong-blue line-clamp-1">
                                {src.title}
                              </p>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sejong-blue shrink-0 mt-0.5" />
                            </div>
                            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                              <span>
                                {src.press} · {src.date}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-sejong-blue font-semibold">
                                연관도 {(src.similarity * 100).toFixed(0)}%
                              </span>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <span className="text-[10px] text-slate-400 block px-1">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-sky-400 flex items-center justify-center text-xs font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 bg-sejong-blue rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-sejong-blue rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-sejong-blue rounded-full animate-bounce" />
              <span className="text-xs font-medium text-slate-500 ml-2">
                15년 뉴스 DB 검색 및 AI 리포트 작성 중...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-slate-100/70 border-t border-slate-200/80 shrink-0">
        <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
          <Compass className="w-3 h-3 text-sejong-blue" /> 2012~2026 시정 분석 추천 질문
        </p>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {ARCHIVE_QUERY_SUGGESTIONS.map((queryText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSend(queryText)}
              disabled={isTyping}
              className="whitespace-nowrap px-2.5 py-1.5 bg-white hover:bg-sejong-blue hover:text-white disabled:opacity-50 border border-slate-200/90 rounded-lg text-xs font-medium text-slate-700 transition-all shadow-2xs hover:shadow-xs shrink-0"
            >
              {queryText}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
