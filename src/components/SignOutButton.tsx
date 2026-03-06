"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm text-neutral-600 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
    >
      로그아웃
    </button>
  );
}
