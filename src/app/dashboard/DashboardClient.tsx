"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { SignOutButton } from "@/components/SignOutButton";

export function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      const notice = searchParams.get("notice");
      const cb = `/dashboard${notice ? `?notice=${encodeURIComponent(notice)}` : ""}`;
      router.replace(`/auth/signin?callbackUrl=${encodeURIComponent(cb)}`);
    }
  }, [status, router, searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-4">
        <div
          className="h-10 w-10 rounded-full border-2 border-primary-600 border-t-transparent animate-spin"
          aria-hidden
        />
        <p className="text-sm font-medium text-slate-600">대시보드를 불러오는 중입니다…</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-primary-600">
            세종 패널
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{session.user?.name ?? session.user?.email}</span>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-9 px-3 rounded-lg bg-gray-200 text-slate-700 text-sm font-medium hover:bg-gray-300 transition"
            >
              내 정보 수정
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">마이페이지</h1>
        <p className="text-slate-600 mb-8">회원 정보 확인 및 설정을 관리합니다.</p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900 mb-4">내 계정</h2>
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">이름</dt>
                <dd className="font-medium text-slate-900">{session.user?.name ?? "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">이메일</dt>
                <dd className="font-medium text-slate-900">{session.user?.email ?? "-"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900 mb-4">설문 참여 정보</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              추가 정보(성별/연령대/관심 분야 등) 수정은 준비 중입니다. 필요 시 운영팀에 문의해 주세요.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/onboarding"
                className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-sejong-blue text-white text-sm font-semibold hover:brightness-110 transition"
              >
                추가 정보 입력/수정
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
              >
                홈으로
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button
            type="button"
            onClick={() => {
              const ok = confirm("정말 탈퇴하시겠습니까?");
              if (!ok) return;
              alert("회원 탈퇴 기능은 준비 중입니다. 필요 시 관리자에게 요청해 주세요.");
            }}
            className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-gray-200 text-slate-700 text-sm font-semibold hover:bg-gray-300 transition"
          >
            회원 탈퇴
          </button>
        </div>
      </main>
    </div>
  );
}

