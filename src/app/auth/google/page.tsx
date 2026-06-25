"use client";

import { Suspense, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function GoogleAuthStartInner() {
  const searchParams = useSearchParams();
  const started = useRef(false);

  const raw = searchParams.get("callbackUrl")?.trim() ?? "";
  const callbackUrl =
    raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/auth/signin")
      ? raw === "/onboarding"
        ? "/auth/onboarding"
        : raw
      : "/auth/onboarding";

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    signIn("google", { callbackUrl }).catch(() => {});
  }, [callbackUrl]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <p className="text-neutral-600 text-sm">Google 로그인으로 이동 중...</p>
    </div>
  );
}

export default function GoogleAuthStartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-neutral-600 text-sm">Google 로그인으로 이동 중...</p>
        </div>
      }
    >
      <GoogleAuthStartInner />
    </Suspense>
  );
}
