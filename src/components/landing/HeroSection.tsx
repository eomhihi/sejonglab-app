import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50/50" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-300/20 rounded-full blur-3xl" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          세종시민 여러분을 초대합니다
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6">
          세종시민 패널에
          <br />
          <span className="text-primary-600">함께해 주세요</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          시민의 목소리를 정책과 서비스 개선에 반영합니다.
          <br className="hidden sm:block" />
          에어봇(AirBBot)으로 설문부터 리포트까지 한 번에, 신뢰할 수 있는 방식으로 진행됩니다.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signin"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-primary-600 text-white font-semibold px-8 py-4 hover:bg-primary-700 transition shadow-lg shadow-primary-600/25"
          >
            패널 참여 신청하기
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border-2 border-slate-300 text-slate-700 font-semibold px-8 py-4 hover:border-primary-400 hover:text-primary-700 transition"
          >
            어떻게 진행되나요?
          </a>
        </div>
      </div>
    </section>
  );
}
