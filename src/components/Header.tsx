"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isAdmin =
    isLoggedIn && session?.user?.email?.toLowerCase().trim() === "eomhihi007@gmail.com";

  async function handleSignOut() {
    await signOut({ callbackUrl: "/", redirect: false });
    router.refresh();
    window.location.replace("/");
  }

  return (
    <header className="flex justify-between items-center p-4 bg-white border-b">
      <Link href="/" className="text-xl font-bold text-[#004B8D]">
        Sejong Lab
      </Link>
      <nav className="flex gap-4 items-center">
        {status === "loading" ? (
          <span className="text-sm text-gray-400">…</span>
        ) : isLoggedIn ? (
          <>
            {isAdmin && (
              <Link href="/admin" className="text-[#004B8D] font-bold border-b-2 border-[#004B8D]">
                「관리자」
              </Link>
            )}
            <Link
              href="/dashboard"
              className="px-3 py-1 text-sm text-slate-700 rounded bg-gray-200 hover:bg-gray-300"
            >
              내 정보 수정
            </Link>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="px-3 py-1 text-sm text-gray-500 border rounded hover:bg-gray-50"
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link href="/auth/signin" className="px-3 py-1 text-sm text-[#004B8D] border border-[#004B8D] rounded hover:bg-sky-50">
            로그인
          </Link>
        )}
      </nav>
    </header>
  );
}