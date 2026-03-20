"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { BfCacheSessionSync } from "@/components/BfCacheSessionSync";

export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider refetchOnWindowFocus>
      <BfCacheSessionSync />
      {children}
    </NextAuthSessionProvider>
  );
}
