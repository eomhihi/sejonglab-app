import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">세종 패널</span>
            <span className="text-slate-500">·</span>
            <span className="text-sm">에어봇(AirBBot) 기반</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-white transition">
              에어봇 소개
            </a>
            <a href="#benefits" className="hover:text-white transition">
              참여 혜택
            </a>
            <Link href="/auth/signin" className="hover:text-white transition">
              패널 신청
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-sm text-slate-500 text-center sm:text-left">
          © 세종시민 패널. 클라우드 기반 설문·리포트 통합 관리.
        </p>
      </div>
    </footer>
  );
}
