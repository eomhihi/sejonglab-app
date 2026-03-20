"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut } from "lucide-react";

// 관리자 접근: 이 이메일만 /admin 및 헤더 「관리자」 링크 노출
const ADMIN_EMAIL = "eomhihi007@gmail.com";

export function SejongHeader() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isAdmin = isLoggedIn && session?.user?.email === ADMIN_EMAIL;

  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    await signOut({ callbackUrl: "/", redirect: false });
    router.refresh();
    window.location.replace("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-3">
            <div className="px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-[#004B8D] to-sky-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs whitespace-nowrap">Sejong Lab</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-[#004B8D]">세종랩</span>
              <span className="text-xs text-slate-500">Data Research</span>
            </div>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-700 hover:text-[#004B8D] transition-colors">
              서비스 소개
            </Link>
            <Link href="#about" className="text-sm font-medium text-slate-700 hover:text-[#004B8D] transition-colors">
              AirBBot
            </Link>
            <Link href="#benefits" className="text-sm font-medium text-slate-700 hover:text-[#004B8D] transition-colors">
              참여 혜택
            </Link>
            {isAdmin && (
              <>
                <Link href="/admin" className="text-sm font-bold text-[#004B8D] hover:text-[#003666] transition-colors">
                  관리자
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  로그아웃
                </button>
              </>
            )}
            {isLoggedIn && !isAdmin && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
              >
                로그아웃
              </button>
            )}
          </nav>

          {/* CTA 버튼: 로그인 시 로그아웃 무조건 노출 (뒤로가기·bfcache 후 status 반영) */}
          <div className="flex items-center gap-3">
            {status === "loading" ? (
              <span className="text-sm text-slate-400 px-2" aria-hidden>
                …
              </span>
            ) : isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-md"
              >
                로그아웃
              </button>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-[#004B8D] hover:bg-sky-50 rounded-lg transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-[#004B8D] hover:bg-[#003666] rounded-lg transition-colors shadow-md shadow-[#004B8D]/25"
                >
                  패널 신청
                </Link>
              </>
            )}

            {/* 모바일 메뉴 버튼 */}
            <button
              className="md:hidden p-2 text-slate-700 hover:text-[#004B8D] transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="메뉴 열기"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100">
            <nav className="flex flex-col gap-2">
              <Link
                href="#features"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-[#004B8D] rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                서비스 소개
              </Link>
              <Link
                href="#about"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-[#004B8D] rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                AirBBot
              </Link>
              <Link
                href="#benefits"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-[#004B8D] rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                참여 혜택
              </Link>
              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    className="px-4 py-2 text-sm font-bold text-[#004B8D] hover:bg-sky-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    관리자
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </>
              )}
              {isLoggedIn && !isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
