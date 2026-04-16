import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-sky-100 via-mint-50 to-sky-100 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-mint-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sejong-blue/10 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-sejong-blue" />
          <span className="text-sm font-bold text-sejong-blue k-keep">함께 만드는 스마트 세종</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary-800 mb-4 leading-tight drop-shadow-sm font-display k-keep">
          세종시민 패널에 참여해 보세요
        </h2>
        <p className="text-base sm:text-lg text-primary-800 font-medium mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed k-keep">
          간단한 가입 후 설문 초대를 받아 의견을 남기실 수 있습니다.
          <br className="hidden sm:block" />
          세종의 미래를 함께 설계해 주세요.
        </p>

        <Link
          href="/auth/signin"
          className="btn btn-primary h-12 sm:h-14 px-6 sm:px-8 font-bold shadow-lg hover:-translate-y-0.5 font-display"
        >
          지금 패널 신청하기
          <ArrowRight className="w-5 h-5" />
        </Link>

      </div>
    </section>
  );
}
