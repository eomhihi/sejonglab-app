import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SejongInsightsDashboard } from "@/components/insights/SejongInsightsDashboard";

export const metadata: Metadata = {
  title: "세종 로컬 인사이트 대시보드 | 세종랩",
  description: "세종시 패널·응답 인사이트를 한눈에 확인합니다.",
};

/** 대시보드는 클라이언트 차트를 쓰므로 정적 캐시 최소화 */
export const dynamic = "force-dynamic";

export default function SejongInsightsPage() {
  return (
    <>
      <div className="sticky top-0 z-40 border-b border-primary-100/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>
        </div>
      </div>
      <SejongInsightsDashboard />
    </>
  );
}
