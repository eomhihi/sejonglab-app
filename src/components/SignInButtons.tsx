"use client";

import { useMemo } from "react";
import { signIn } from "next-auth/react";
import { useInAppBrowser } from "@/hooks/useInAppBrowser";
import {
  buildGoogleOAuthUrl,
  buildKakaoTalkExternalHref,
  openGoogleLoginInExternalBrowser,
} from "@/lib/open-external-browser";

/** 로그인 후 회원정보 입력(온보딩) — /onboarding 사용 시 미인증 루프 발생 */
const SAFE_CALLBACK_URL = "/auth/onboarding";

const btnBase =
  "w-full h-11 flex items-center justify-center gap-2 rounded-lg px-4 font-medium transition";

type SignInButtonsProps = {
  callbackUrl?: string;
};

export function SignInButtons({ callbackUrl }: SignInButtonsProps) {
  const next =
    callbackUrl &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//") &&
    !callbackUrl.startsWith("/auth/signin")
      ? callbackUrl === "/onboarding"
        ? SAFE_CALLBACK_URL
        : callbackUrl
      : SAFE_CALLBACK_URL;

  const { userAgent, isGoogleOAuthBlocked, inAppName, isAndroid } = useInAppBrowser();
  const isKakaoTalk = inAppName === "kakaotalk";

  const googleOAuthUrl = useMemo(() => buildGoogleOAuthUrl({ callbackUrl: next }), [next]);
  const kakaoTalkGoogleHref = useMemo(
    () => (isKakaoTalk ? buildKakaoTalkExternalHref(googleOAuthUrl) : null),
    [isKakaoTalk, googleOAuthUrl]
  );

  const handleSignIn = (provider: string) => {
    if (provider === "google" && isGoogleOAuthBlocked) {
      if (isKakaoTalk) return;
      const opened = openGoogleLoginInExternalBrowser({
        callbackUrl: next,
        inAppName,
        isAndroid,
        userAgent,
      });
      if (!opened) {
        alert(
          "이 앱에서는 Google 로그인이 차단됩니다.\n화면 우측 상단 ⋯ → Safari·Chrome에서 열기 후 다시 시도해 주세요."
        );
      }
      return;
    }
    signIn(provider, { callbackUrl: next }).catch(() => {});
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => handleSignIn("kakao")}
        className={`${btnBase} bg-[#FEE500] text-[#191919] hover:opacity-90`}
      >
        <KakaoIcon />
        카카오로 로그인
      </button>
      <button
        type="button"
        onClick={() => handleSignIn("naver")}
        className={`${btnBase} bg-[#03C75A] text-white hover:opacity-90`}
      >
        <NaverIcon />
        네이버로 로그인
      </button>
      {kakaoTalkGoogleHref ? (
        <a
          href={kakaoTalkGoogleHref}
          className={`${btnBase} bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-50 no-underline`}
        >
          <GoogleIcon />
          Google로 로그인
        </a>
      ) : (
        <button
          type="button"
          onClick={() => handleSignIn("google")}
          className={`${btnBase} bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-50`}
        >
          <GoogleIcon />
          Google로 로그인
        </button>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3Z" />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845Z" />
    </svg>
  );
}
