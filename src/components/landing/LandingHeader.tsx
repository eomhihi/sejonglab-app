import Link from "next/link";

export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary-700">세종 패널</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/#services" className="text-sm text-slate-600 hover:text-primary-600 transition">
            에어봇 소개
          </Link>
          <Link href="/#benefits" className="text-sm text-slate-600 hover:text-primary-600 transition">
            참여 혜택
          </Link>
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-medium px-4 py-2.5 hover:bg-primary-700 transition"
          >
            패널 신청
          </Link>
        </nav>
      </div>
    </header>
  );
}
