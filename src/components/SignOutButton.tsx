"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ callbackUrl: "/", redirect: false });
    router.refresh();
    window.location.replace("/");
  }

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      className="text-sm text-neutral-600 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
    >
      로그아웃
    </button>
  );
}
