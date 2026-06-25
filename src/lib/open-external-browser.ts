type InAppName = "kakaotalk" | "instagram" | "facebook" | "line" | "naver" | "webview" | "unknown";

function getOrigin(): string {
  return typeof window !== "undefined" ? window.location.origin : "https://sejonglab.com";
}

/**
 * Google OAuth 진입 URL (외부 브라우저용).
 * /api/auth/signin/google 직접 호출 시 CSRF 없어 커스텀 signIn 페이지로 되돌아가는 문제를 피함.
 * /auth/google 에서 signIn()으로 CSRF 포함 OAuth 시작.
 */
export function buildGoogleEntryUrl(params: {
  origin?: string;
  callbackUrl?: string;
}): string {
  const origin = params.origin ?? getOrigin();
  const path = params.callbackUrl ?? "/auth/onboarding";
  const search = new URLSearchParams({ callbackUrl: path });
  return `${origin}/auth/google?${search.toString()}`;
}

/** 카카오톡 인앱 → 외부 브라우저(Chrome/Safari)로 열기 (카카오 공식 스킴) */
export function openKakaoTalkExternalBrowser(url: string): void {
  window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
}

/** 카카오톡에서 Google 로그인 시 외부 브라우저 `<a href>` */
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

/** 인앱 브라우저에서 Google 로그인 진입 페이지를 외부 브라우저로 열기 */
export function openGoogleLoginInExternalBrowser(options: {
  callbackUrl: string;
  inAppName: InAppName | null;
  isAndroid: boolean;
}): boolean {
  const entryUrl = buildGoogleEntryUrl({ callbackUrl: options.callbackUrl });

  if (options.inAppName === "kakaotalk") {
    openKakaoTalkExternalBrowser(entryUrl);
    return true;
  }

  if (options.isAndroid) {
    try {
      openAndroidChrome(entryUrl);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
