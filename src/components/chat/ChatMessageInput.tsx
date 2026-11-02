import { Search, Send } from "lucide-react";

interface ChatMessageInputProps {
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  isTyping: boolean;
}

export function ChatMessageInput({
  input,
  setInput,
  onSend,
  isTyping,
}: ChatMessageInputProps) {
  return (
    <div className="p-3 bg-white border-t border-slate-200/90 shrink-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="2012~2026 세종시 시정·개발·교통·교육·경제 이슈를 질문하세요..."
            disabled={isTyping}
            className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-300/80 focus:border-sejong-blue focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sejong-blue/20 transition-all disabled:opacity-60"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="px-4 py-2.5 bg-sejong-blue hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-colors shadow-sm flex items-center justify-center shrink-0"
          aria-label="질문 전송"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
      <p className="text-[10px] text-center text-slate-400 mt-2">
        * 2012~2026 세종시 뉴스 아카이브 하이브리드 RAG 검색 및 Gemini 1.5 Flash 분석 리포트
      </p>
    </div>
  );
}
