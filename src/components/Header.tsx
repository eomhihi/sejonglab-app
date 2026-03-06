import Link from "next/link";
import { Session } from "next-auth";
import { SignOutButton } from "./SignOutButton";

export function Header({ session }: { session: Session | null }) {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          Next App
        </Link>
        <nav className="flex items-center gap-4">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                대시보드
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-neutral-900 dark:text-white"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
