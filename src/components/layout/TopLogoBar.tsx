"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

/** 고정 로고 바 높이: Tailwind `h-14` (3.5rem)과 동기화 */
export const TOP_LOGO_BAR_HEIGHT_CLASS = "h-28 sm:h-24" as const;

export function TopLogoBar() {
  const { status } = useSession();
  const authed = status === "authenticated";

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[80] ${TOP_LOGO_BAR_HEIGHT_CLASS} flex items-center bg-white/80 backdrop-blur-md border-b border-slate-200/60`}
    >
      <div className="max-w-7xl mx-auto w-full px-4">
        <div className="flex flex-row items-center justify-between gap-3 sm:gap-6">
          <div className="flex flex-row items-center gap-4 sm:gap-7 min-w-0 flex-wrap">
            <div className="flex flex-col items-start shrink-0 w-max">
              <Link
                href="/"
                className="inline-flex items-center text-[15px] sm:text-base font-extrabold tracking-[0.22em] uppercase text-black font-display"
              >
                SEJONG LAB
              </Link>

              <span
                className="mt-0.5 w-full text-[9px] sm:text-[10px] font-bold uppercase text-gray-500 tracking-[0.98em] [-webkit-text-size-adjust:100%] [-moz-text-size-adjust:100%] [-ms-text-size-adjust:100%] -mr-[0.98em] font-display"
              >
                Research Data
              </span>
            </div>

            <p className="min-w-0 text-xs sm:text-sm text-gray-400 leading-snug k-keep">
              세종랩은 세종시 정책의 근거를 만드는 데이터 전문가 그룹이
              <br />
              시민의 목소리를 직접 듣기 위해 구축한 독립 리서치 플랫폼입니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-shrink-0 pt-0.5">
            {authed ? (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn btn-ghost text-sm"
              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/auth/signin"
                className="btn btn-ghost text-sm"
              >
                로그인
              </Link>
            )}

            <Link
              href="/signup"
              className="btn text-sm font-extrabold bg-slate-900 text-white shadow-sm hover:bg-slate-900 font-display"
            >
              패널 신청
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
