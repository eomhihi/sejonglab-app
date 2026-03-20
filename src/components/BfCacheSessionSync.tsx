"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

/**
 * 브라우저 bfcache(뒤로가기) 복원 시 세션을 다시 가져와 헤더 등이 로그아웃 상태와 맞도록 동기화
 */
export function BfCacheSessionSync() {
  const { update } = useSession();

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        void update();
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [update]);

  return null;
}
