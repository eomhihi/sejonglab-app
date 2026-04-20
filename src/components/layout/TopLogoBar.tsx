"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { SejongLogoLockup } from "@/components/brand/SejongLogoLockup";

/** 고정 로고 바 높이: Tailwind `h-14` (3.5rem)과 동기화 */
export const TOP_LOGO_BAR_HEIGHT_CLASS = "h-28 sm:h-24" as const;

const loginBtnClass =
  "inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl font-semibold transition text-sm bg-white border border-header-footer text-header-footer hover:bg-slate-50";

const panelCtaClass =
  "inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl font-semibold transition text-sm font-extrabold bg-header-footer border border-header-footer text-white shadow-sm hover:brightness-110";

export function TopLogoBar() {
  const { status } = useSession();
  const authed = status === "authenticated";

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[80] ${TOP_LOGO_BAR_HEIGHT_CLASS} flex items-center bg-white border-b border-slate-200/80`}
    >
      <div className="max-w-7xl mx-auto w-full px-4">
        <div className="flex flex-row items-center justify-between gap-3 sm:gap-6">
          <div className="flex flex-row items-center gap-4 sm:gap-7 min-w-0 flex-wrap">
            <SejongLogoLockup variant="topbar" href="/" />

            <p className="min-w-0 text-xs sm:text-sm text-gray-500 leading-snug k-keep">
              세종랩은 세종시 정책의 근거를 만드는 데이터 전문가 그룹이{" "}
              <br className="hidden sm:block" />
              시민의 목소리를 직접 듣기 위해 구축한 전문 리서치 플랫폼입니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-shrink-0 pt-0.5">
            {authed ? (
              <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className={loginBtnClass}>
                로그아웃
              </button>
            ) : (
              <Link href="/auth/signin" className={loginBtnClass}>
                로그인
              </Link>
            )}

            <Link href="/signup" className={panelCtaClass}>
              패널 신청
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
