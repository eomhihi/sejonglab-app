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

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#004B8D]/10 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-[#004B8D]" />
          <span className="text-sm font-bold text-[#004B8D]">함께 만드는 스마트 세종</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#002D56] mb-4 leading-tight drop-shadow-sm">
          세종시민 패널에 참여해 보세요
        </h2>
        <p className="text-base sm:text-lg text-[#002D56] font-medium mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
          간단한 가입 후 설문 초대를 받아 의견을 남기실 수 있습니다.
          <br className="hidden sm:block" />
          세종의 미래를 함께 설계해 주세요.
        </p>

        <Link
          href="/auth/signin"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#004B8D] text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 hover:bg-[#003666] transition-all shadow-lg shadow-[#004B8D]/25 hover:shadow-xl hover:-translate-y-0.5"
        >
          지금 패널 신청하기
          <ArrowRight className="w-5 h-5" />
        </Link>

      </div>
    </section>
  );
}
