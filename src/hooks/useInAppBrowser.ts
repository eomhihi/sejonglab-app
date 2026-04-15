import { useEffect, useMemo, useRef, useState } from "react";

type InAppName = "kakaotalk" | "instagram" | "facebook" | "line" | "unknown";

export type InAppBrowserState = {
  userAgent: string;
  isMobile: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isInApp: boolean;
  inAppName: InAppName | null;
  canTryOpenChrome: boolean;
  tryOpenInChrome: () => void;
};

function detectInApp(ua: string): { isInApp: boolean; inAppName: InAppName | null } {
  const s = ua.toLowerCase();

  // 대표 인앱 브라우저 UA 토큰
  if (s.includes("kakaotalk")) return { isInApp: true, inAppName: "kakaotalk" };
  if (s.includes("instagram")) return { isInApp: true, inAppName: "instagram" };
  if (s.includes("fbav") || s.includes("fban") || s.includes("facebook")) {
    return { isInApp: true, inAppName: "facebook" };
  }
  if (s.includes("line/")) return { isInApp: true, inAppName: "line" };

  // 기타 WebView류 (정확도 낮아 false로 두되, 필요 시 확장)
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
  const triedRef = useRef(false);

  useEffect(() => {
    setUa(typeof navigator !== "undefined" ? navigator.userAgent : "");
  }, []);

  const { isInApp, inAppName } = useMemo(() => detectInApp(ua), [ua]);
  const isMobile = useMemo(() => isMobileUA(ua), [ua]);
  const isAndroid = useMemo(() => isAndroidUA(ua), [ua]);
  const isIOS = useMemo(() => isIOSUA(ua), [ua]);

  const tryOpenInChrome = () => {
    // Android에서만 intent:// 시도. iOS는 시스템 정책상 직접 전환이 제한적이라 안내만.
    if (!isAndroid || !isInApp) return;
    if (triedRef.current) return;
    triedRef.current = true;

    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      if (!url) return;

      // intent 스킴 구성: 현재 URL을 그대로 Chrome에 전달
      // 예) intent://sejonglab.com/auth/signin#Intent;scheme=https;package=com.android.chrome;end
      const u = new URL(url);
      const intentUrl = `intent://${u.host}${u.pathname}${u.search}${u.hash}` +
        `#Intent;scheme=${u.protocol.replace(":", "")};package=com.android.chrome;end`;
      window.location.href = intentUrl;
    } catch {
      // 실패해도 안내 배너로 유도되므로 무시
    }
  };

  return {
    userAgent: ua,
    isMobile,
    isAndroid,
    isIOS,
    isInApp,
    inAppName,
    canTryOpenChrome: isAndroid && isInApp,
    tryOpenInChrome,
  };
}

