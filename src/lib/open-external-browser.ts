type InAppName = "kakaotalk" | "instagram" | "facebook" | "line" | "naver" | "webview" | "unknown";

/** 로그인 페이지 URL (외부 브라우저에서 Google 자동 로그인용) */
export function buildSignInUrl(params: {
  origin?: string;
  callbackUrl?: string;
  autoProvider?: "google";
}): string {
  const origin =
    params.origin ??
    (typeof window !== "undefined" ? window.location.origin : "https://sejonglab.com");
  const search = new URLSearchParams();
  if (params.callbackUrl) search.set("callbackUrl", params.callbackUrl);
  if (params.autoProvider) search.set("autoProvider", params.autoProvider);
  const q = search.toString();
  return `${origin}/auth/signin${q ? `?${q}` : ""}`;
}

/** 카카오톡 인앱 → 외부 브라우저(Chrome/Safari)로 열기 (카카오 공식 스킴) */
export function openKakaoTalkExternalBrowser(url: string, userAgent?: string): void {
  const ua = (userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : "")).toLowerCase();
  window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
  setTimeout(() => {
    window.location.href = /iphone|ipad|ipod/.test(ua)
      ? "kakaoweb://closeBrowser"
      : "kakaotalk://inappbrowser/close";
  }, 400);
}

/** Android 인앱 → Chrome intent */
export function openAndroidChrome(url: string): void {
  const u = new URL(url);
  const intentUrl =
    `intent://${u.host}${u.pathname}${u.search}${u.hash}` +
    `#Intent;scheme=${u.protocol.replace(":", "")};package=com.android.chrome;end`;
  window.location.href = intentUrl;
}

/**
 * Google OAuth가 차단된 인앱 환경에서 외부 브라우저로 로그인 페이지를 열고 Google 로그인을 유도.
 * 카카오톡: kakaotalk://web/openExternal 스킴 사용 (가장 안정적).
 */
export function openGoogleLoginInExternalBrowser(options: {
  callbackUrl: string;
  inAppName: InAppName | null;
  isAndroid: boolean;
  userAgent: string;
}): boolean {
  const signInUrl = buildSignInUrl({
    callbackUrl: options.callbackUrl,
    autoProvider: "google",
  });

  if (options.inAppName === "kakaotalk") {
    openKakaoTalkExternalBrowser(signInUrl, options.userAgent);
    return true;
  }

  if (options.isAndroid) {
    try {
      openAndroidChrome(signInUrl);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
