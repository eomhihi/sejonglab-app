import { LayoutGrid } from "lucide-react";
import { BriefingInteractiveDashboard } from "@/components/briefing/BriefingInteractiveDashboard";

/** 카드형 뉴스 블록과 유사한 2열 레이아웃 — 메인 랜딩 중단 대시보드 */
export function MainInteractiveDashboardSection() {
  return (
    <section className="bg-brand-light/90 py-10 border-y border-brand-ash/45">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-sejong-blue rounded-lg">
                <LayoutGrid className="w-6 h-6 text-white" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">인터랙티브 데이터 대시보드</h2>
                <p className="text-xs text-sejong-blue font-bold">핵심 지표를 한눈에</p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="rounded-lg bg-white border border-brand-ash/50 shadow-sm p-4 sm:p-6 lg:p-8">
              <BriefingInteractiveDashboard embedded />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
