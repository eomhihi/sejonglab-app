"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useInAppBrowser } from "@/hooks/useInAppBrowser";

/** 로그인 후 이동할 URL. signin/에러 페이지가 아닌 고정 경로만 사용해 콜백 루프 방지 */
const SAFE_CALLBACK_URL = "/onboarding";

const IN_APP_LABELS: Record<string, string> = {
  kakaotalk: "카카오톡",
  instagram: "인스타그램",
  facebook: "페이스북",
  line: "라인",
  naver: "네이버",
  webview: "앱 내 브라우저",
  unknown: "앱 내 브라우저",
};

export function SignInButtons({ callbackUrl }: { callbackUrl?: string }) {
  const next =
    callbackUrl &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//") &&
    !callbackUrl.startsWith("/auth/")
      ? callbackUrl
      : SAFE_CALLBACK_URL;

  const {
    isGoogleOAuthBlocked,
    inAppName,
    isIOS,
    isAndroid,
    canTryOpenChrome,
    tryOpenInChrome,
    copyCurrentUrl,
  } = useInAppBrowser();

  const [showGoogleBlocked, setShowGoogleBlocked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSignIn = (provider: string) => {
    // Google은 인앱/WebView에서 OAuth 차단(disallowed_useragent) → 사전 차단·안내
    if (provider === "google" && isGoogleOAuthBlocked) {
      setShowGoogleBlocked(true);
      return;
    }
    signIn(provider, { callbackUrl: next }).catch(() => {});
  };

  const inAppLabel = inAppName ? IN_APP_LABELS[inAppName] ?? "앱 내 브라우저" : "앱 내 브라우저";

  const onCopyLink = async () => {
    const ok = await copyCurrentUrl();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      alert("링크 복사에 실패했습니다. 주소창의 URL을 수동으로 복사해 주세요.");
    }
  };

  const onOpenInChrome = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    tryOpenInChrome(`${origin}/auth/signin`);
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {isGoogleOAuthBlocked && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900 leading-relaxed">
            <p className="font-semibold mb-1">Google 로그인 안내</p>
            <p>
              {inAppLabel}에서는 Google 보안 정책으로 로그인이 차단됩니다. Chrome·Safari 등
              <strong> 외부 브라우저</strong>에서 다시 시도해 주세요.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => handleSignIn("google")}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-white border border-neutral-300 text-neutral-800 px-4 font-medium hover:bg-neutral-50 transition"
        >
          <GoogleIcon />
          Google로 로그인
        </button>
        <button
          type="button"
          onClick={() => handleSignIn("kakao")}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-[#FEE500] text-[#191919] px-4 font-medium hover:opacity-90 transition"
        >
          <KakaoIcon />
          카카오로 로그인
        </button>
        <button
          type="button"
          onClick={() => handleSignIn("naver")}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-[#03C75A] text-white px-4 font-medium hover:opacity-90 transition"
        >
          <NaverIcon />
          네이버로 로그인
        </button>
      </div>

      {showGoogleBlocked && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="google-blocked-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="google-blocked-title" className="text-lg font-bold text-slate-900 mb-2">
              Google 로그인을 사용할 수 없습니다
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              현재 <strong>{inAppLabel}</strong> 화면에서는 Google 보안 정책(
              <span className="font-mono text-xs">disallowed_useragent</span>)으로 로그인이 차단됩니다.
              카카오·네이버 로그인은 이 화면에서 계속 이용할 수 있습니다.
            </p>

            {isIOS ? (
              <ol className="text-sm text-slate-700 space-y-2 mb-5 list-decimal list-inside">
                <li>화면 우측 상단 <strong>⋯</strong> 또는 <strong>공유</strong> 버튼을 누르세요</li>
                <li><strong>Safari에서 열기</strong> 또는 <strong>브라우저로 열기</strong>를 선택하세요</li>
                <li>열린 Safari에서 <strong>Google로 로그인</strong>을 다시 시도하세요</li>
              </ol>
            ) : isAndroid ? (
              <ol className="text-sm text-slate-700 space-y-2 mb-5 list-decimal list-inside">
                <li>아래 <strong>Chrome으로 열기</strong>를 누르거나, 링크를 복사해 Chrome에서 열어주세요</li>
                <li>Chrome에서 <strong>Google로 로그인</strong>을 다시 시도하세요</li>
              </ol>
            ) : (
              <p className="text-sm text-slate-700 mb-5">
                Chrome·Safari 등 일반 브라우저에서 <strong>sejonglab.com</strong>을 열고 다시 시도해 주세요.
              </p>
            )}

            <div className="flex flex-col gap-2">
              {canTryOpenChrome && (
                <button
                  type="button"
                  onClick={onOpenInChrome}
                  className="w-full h-11 rounded-lg bg-sejong-blue text-white font-semibold text-sm hover:bg-sejong-blue-dark transition"
                >
                  Chrome으로 열기
                </button>
              )}
              <button
                type="button"
                onClick={onCopyLink}
                className="w-full h-11 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold text-sm hover:bg-slate-50 transition"
              >
                {copied ? "링크가 복사되었습니다" : "로그인 페이지 링크 복사"}
              </button>
              <button
                type="button"
                onClick={() => setShowGoogleBlocked(false)}
                className="w-full h-11 rounded-lg text-slate-600 font-medium text-sm hover:text-slate-900 transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
