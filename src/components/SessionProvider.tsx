"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { ReactNode } from "react";
import { BfCacheSessionSync } from "@/components/BfCacheSessionSync";

export function SessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  /** 서버에서 가져온 세션 — 클라이언트 초기 렌더와 일치시켜 하이드레이션 불일치를 줄임 */
  session?: Session | null;
}) {
  return (
    <NextAuthSessionProvider session={session ?? undefined} refetchOnWindowFocus>
      <BfCacheSessionSync />
      {children}
    </NextAuthSessionProvider>
  );
}
