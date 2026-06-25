import { useEffect, useMemo, useState } from "react";
import { openKakaoTalkExternalBrowser } from "@/lib/open-external-browser";

type InAppName = "kakaotalk" | "instagram" | "facebook" | "line" | "naver" | "webview" | "unknown";

export type InAppBrowserState = {
  userAgent: string;
  isMobile: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isInApp: boolean;
  inAppName: InAppName | null;
  /** Google OAuth가 차단되는 인앱/WebView 환경 (disallowed_useragent 예방) */
  isGoogleOAuthBlocked: boolean;
  canTryOpenChrome: boolean;
  tryOpenInChrome: (targetUrl?: string) => void;
  /** 카카오톡 인앱에서 외부 브라우저로 URL 열기 */
  openKakaoTalkExternal: (url: string) => void;
  copyCurrentUrl: () => Promise<boolean>;
};

function detectInApp(ua: string): { isInApp: boolean; inAppName: InAppName | null } {
  const s = ua.toLowerCase();

  if (s.includes("kakaotalk")) return { isInApp: true, inAppName: "kakaotalk" };
  if (s.includes("instagram")) return { isInApp: true, inAppName: "instagram" };
  if (s.includes("fbav") || s.includes("fban") || s.includes("facebook")) {
    return { isInApp: true, inAppName: "facebook" };
  }
  if (s.includes("line/")) return { isInApp: true, inAppName: "line" };
  // 네이버 메일·검색 등 인앱 (Whale 브라우저는 제외)
  if (s.includes("naver(inapp") || s.includes("naversearch")) {
    return { isInApp: true, inAppName: "naver" };
  }
  if (s.includes("tiktok")) return { isInApp: true, inAppName: "unknown" };
  if (s.includes("twitter") || s.includes("x.com")) return { isInApp: true, inAppName: "unknown" };

  // Android WebView (Google OAuth disallowed_useragent 주요 원인)
  if (s.includes("; wv)") || s.includes("; wv;") || s.includes("webview")) {
    return { isInApp: true, inAppName: "webview" };
  }

  return { isInApp: false, inAppName: null };
}

function isMobileUA(ua: string): boolean {
  const s = ua.toLowerCase();
  return s.includes("iphone") || s.includes("ipad") || s.includes("ipod") || s.includes("android");
}

function isAndroidUA(ua: string): boolean {
  return ua.toLowerCase().includes("android");
}

function isIOSUA(ua: string): boolean {
  const s = ua.toLowerCase();
  return s.includes("iphone") || s.includes("ipad") || s.includes("ipod");
}

/**
 * 인앱 브라우저(카카오톡/인스타/페북/라인 등) 감지 + 안내/자동 전환 시도에 필요한 상태를 제공.
 *
 * - disallowed_useragent(구글 OAuth 차단) 예방 목적: "외부 브라우저로 열기" 유도
 * - 인증 흐름(NextAuth)에는 영향 없음: UI 레이어에서만 사용
 */
export function useInAppBrowser(): InAppBrowserState {
  const [ua, setUa] = useState("");

  useEffect(() => {
    setUa(typeof navigator !== "undefined" ? navigator.userAgent : "");
  }, []);

  const { isInApp, inAppName } = useMemo(() => detectInApp(ua), [ua]);
  const isMobile = useMemo(() => isMobileUA(ua), [ua]);
  const isAndroid = useMemo(() => isAndroidUA(ua), [ua]);
  const isIOS = useMemo(() => isIOSUA(ua), [ua]);

  const tryOpenInChrome = (targetUrl?: string) => {
    if (!isAndroid || !isInApp) return;

    try {
      const url = targetUrl || (typeof window !== "undefined" ? window.location.href : "");
      if (!url) return;

      const u = new URL(url);
      const intentUrl =
        `intent://${u.host}${u.pathname}${u.search}${u.hash}` +
        `#Intent;scheme=${u.protocol.replace(":", "")};package=com.android.chrome;end`;
      window.location.href = intentUrl;
    } catch {
      // 실패해도 안내 배너로 유도되므로 무시
    }
  };

  const copyCurrentUrl = async (): Promise<boolean> => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        return true;
      }
    } catch {
      // fallback below
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };

  const openKakaoTalkExternal = (url: string) => {
    openKakaoTalkExternalBrowser(url, ua);
  };

  return {
    userAgent: ua,
    isMobile,
    isAndroid,
    isIOS,
    isInApp,
    inAppName,
    isGoogleOAuthBlocked: isInApp,
    canTryOpenChrome: isAndroid && isInApp,
    tryOpenInChrome,
    openKakaoTalkExternal,
    copyCurrentUrl,
  };
}

