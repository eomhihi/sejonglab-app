import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BriefingInteractiveDashboard } from "@/components/briefing/BriefingInteractiveDashboard";

export const metadata: Metadata = {
  title: "월간 브리핑 | 2026 세종시 생성형 AI 인식 조사",
  description:
    "세종시민 패널 설문 결과를 바탕으로 한 생성형 AI 인식·정책 기대 월간 브리핑 리포트입니다.",
};

export default function BriefingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 min-h-14 flex items-center gap-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors shrink-0"
          >
            <span className="text-slate-500" aria-hidden>
              &lt;
            </span>
            뒤로
          </Link>
          <span className="text-sm sm:text-base font-semibold text-slate-900 truncate border-l border-slate-200 pl-4">
            월간 브리핑
          </span>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="mb-12 sm:mb-16">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase mb-4">
              Monthly report · March 2026
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-semibold text-slate-900 tracking-tight leading-tight mb-4">
              2026 세종시 생성형 AI 인식 조사
            </h1>
            <p className="text-sm text-slate-500">발행일 2026년 3월 31일</p>
          </div>

          <section
            className="mb-14 sm:mb-20 p-8 sm:p-10 lg:p-12 bg-white border border-slate-200/90 shadow-sm"
            aria-labelledby="exec-summary-heading"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-6 bg-blue-600 shrink-0" aria-hidden />
              <h2 id="exec-summary-heading" className="text-lg sm:text-xl font-semibold text-slate-900">
                Executive Summary
              </h2>
            </div>
            <div className="max-w-none text-slate-700 leading-relaxed space-y-4 text-[15px] sm:text-base">
              <p>
                이번 조사에서 응답자의 다수는 생성형 AI를 인지하고 있으며, 실제 업무·학습·일상에서의 사용 경험도
                빠르게 확대되고 있습니다. 다만 개인정보·저작권·일자리에 대한 우려와 함께, 공공 분야 도입에 대해서는
                &lsquo;투명한 기준과 설명 가능한 서비스&rsquo;를 전제로 한 점진적 도입을 선호하는 경향이 두드러집니다.
              </p>
              <p>
                정책 측면에서는 지역 맞춤형 디지털·AI 거버넌스에 대한 기대가 높으나, 신뢰도는 아직 중간 수준에 머물러
                있어 정보 제공과 시민 소통 채널 강화가 선행 과제로 제시됩니다. 아래 본문에서는 핵심 지표를 시각화하여
                세부 해석과 시사점을 제시합니다.
              </p>
            </div>
          </section>

          <section
            className="mb-14 sm:mb-20 py-10 sm:py-14 px-6 sm:px-10 lg:px-12 bg-white border border-slate-200/90"
            aria-label="인터랙티브 데이터 대시보드"
          >
            <BriefingInteractiveDashboard />
          </section>

          <div className="mt-16 sm:mt-20 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center sm:justify-start items-stretch sm:items-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white text-sm font-semibold rounded-sm hover:bg-blue-700 transition-colors shadow-sm"
            >
              메인으로 돌아가기
              <ChevronRight className="w-4 h-4 opacity-90" />
            </Link>
            <span title="추후 제공" className="inline-flex">
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-200 bg-white text-sm font-medium text-slate-400 rounded-sm cursor-not-allowed w-full sm:w-auto"
              >
                이전 브리핑 보기
              </button>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
