import { Bot, Database, RotateCcw, ChevronDown } from "lucide-react";

interface ChatHeaderProps {
  onReset: () => void;
  onClose: () => void;
}

export function ChatHeader({ onReset, onClose }: ChatHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-oxford px-5 py-4 flex items-center justify-between border-b border-slate-700/60 text-white shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-sejong-blue/30 border border-sejong-blue/50 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-sky-400" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base truncate leading-tight">
              세종랩 AI 뉴스·정책 분석가
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Database className="w-3 h-3" /> 2012~2026 RAG
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            AI Policy Analyst · 세종시 뉴스 빅데이터 분석 엔진
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onReset}
          title="대화 초기화"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          title="닫기"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
