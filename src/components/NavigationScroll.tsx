"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * 라우트(pathname) 변경 시 스크롤을 맨 위로 복귀.
 * URL에 해시(#...)가 있으면 앵커 스크롤을 유지하기 위해 건너뜀.
 */
export function NavigationScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (typeof window === "undefined") return;
      if (window.location.hash) return;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
