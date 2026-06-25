type InAppName = "kakaotalk" | "instagram" | "facebook" | "line" | "naver" | "webview" | "unknown";

function getOrigin(): string {
  return typeof window !== "undefined" ? window.location.origin : "https://sejonglab.com";
}

/** NextAuth Google OAuth 시작 URL — 외부 브라우저에서 열면 곧바로 Google 로그인 화면으로 이동 */
export function buildGoogleOAuthUrl(params: {
  origin?: string;
  callbackUrl?: string;
}): string {
  const origin = params.origin ?? getOrigin();
  const path = params.callbackUrl ?? "/auth/onboarding";
  const callback =
    path.startsWith("http") ? path : `${origin}${path.startsWith("/") ? path : `/${path}`}`;
  const search = new URLSearchParams({ callbackUrl: callback });
  return `${origin}/api/auth/signin/google?${search.toString()}`;
}

/** 카카오톡 인앱 → 외부 브라우저(Chrome/Safari)로 열기 (카카오 공식 스킴) */
export function openKakaoTalkExternalBrowser(url: string): void {
  window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
  // 인앱 브라우저 강제 닫기는 생략 — 닫기 직후 같은 로그인 화면이 반복되는 경우 방지
}

/** 카카오톡에서 Google OAuth를 외부 브라우저로 열 때 사용하는 `<a href>` */
export function buildKakaoTalkExternalHref(targetUrl: string): string {
  return `kakaotalk://web/openExternal?url=${encodeURIComponent(targetUrl)}`;
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
 * 인앱 브라우저에서 Google OAuth URL을 외부 브라우저로 직접 열기.
 * 로그인 중간 페이지 없이 Google 계정 선택 화면으로 이동.
 */
export function openGoogleLoginInExternalBrowser(options: {
  callbackUrl: string;
  inAppName: InAppName | null;
  isAndroid: boolean;
  userAgent: string;
}): boolean {
  const oauthUrl = buildGoogleOAuthUrl({ callbackUrl: options.callbackUrl });

  if (options.inAppName === "kakaotalk") {
    openKakaoTalkExternalBrowser(oauthUrl);
    return true;
  }

  if (options.isAndroid) {
    try {
      openAndroidChrome(oauthUrl);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
