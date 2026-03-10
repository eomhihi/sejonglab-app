'use client';
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.email?.toLowerCase().trim() === 'eomhihi007@gmail.com';

  return (
    <header className="flex justify-between items-center p-4 bg-white border-b">
      <Link href="/" className="text-xl font-bold text-[#004B8D]">Sejong Lab</Link>
      <nav className="flex gap-4 items-center">
        {session && (
          <>
            {isAdmin && (
              <Link href="/admin" className="text-[#004B8D] font-bold border-b-2 border-[#004B8D]">
                「관리자」
              </Link>
            )}
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-3 py-1 text-sm text-gray-500 border rounded hover:bg-gray-50"
            >
              로그아웃
            </button>
          </>
        )}
      </nav>
    </header>
  );
}