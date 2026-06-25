"use client";

import { useEffect, useMemo, useState } from "react";
import { useInAppBrowser } from "@/hooks/useInAppBrowser";

const MESSAGE =
  "Google 로그인은 Chrome·Safari에서 진행됩니다. Google 버튼을 누르면 외부 브라우저로 자동 연결됩니다.";

function storageKey(host: string) {
  return `mobile_guard_dismissed:${host}`;
}

export function MobileGuard() {
  const { isInApp, isMobile, canTryOpenChrome, tryOpenInChrome } = useInAppBrowser();
  const [dismissed, setDismissed] = useState(false);

  const host = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.host;
  }, []);

  useEffect(() => {
    if (!host) return;
    try {
      const v = localStorage.getItem(storageKey(host));
      setDismissed(v === "1");
    } catch {
      // ignore
    }
  }, [host]);

  const visible = isMobile && isInApp && !dismissed;

  const onDismiss = () => {
    setDismissed(true);
    try {
      if (host) localStorage.setItem(storageKey(host), "1");
    } catch {
      // ignore
    }
  };

  // 인앱에서 Android Chrome intent를 "시도"만 해주되, 과도한 리다이렉트/루프는 방지(1회, 사용자 동작 기반).
  const onTryAutoOpen = () => {
    tryOpenInChrome();
  };

  if (!visible) return null;

  return (
    <div className="sticky top-14 z-[55] w-full border-b border-amber-200 bg-amber-50/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-amber-900 leading-snug">{MESSAGE}</p>
        <div className="flex items-center gap-2">
          {canTryOpenChrome ? (
            <button
              type="button"
              onClick={onTryAutoOpen}
              className="h-11 px-3 rounded-lg bg-amber-900 text-amber-50 text-sm font-semibold hover:bg-amber-800 transition"
            >
              크롬으로 열기 시도
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDismiss}
            className="h-11 px-3 rounded-lg border border-amber-300 bg-white text-amber-900 text-sm font-semibold hover:bg-amber-100 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

