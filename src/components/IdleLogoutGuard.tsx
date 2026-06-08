"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

/**
 * 미활동(무활동) 자동 로그아웃 설정값.
 * - IDLE_LOGOUT_TIMEOUT_MS: 이 시간(ms) 동안 아무 활동이 없으면 자동 로그아웃 (기본 10분)
 * - ACTIVITY_THROTTLE_MS: mousemove 등 빈번한 이벤트로 타이머를 과도하게 리셋하지 않도록 스로틀 간격
 * 운영 정책에 맞게 아래 상수만 조정하면 됩니다.
 */
export const IDLE_LOGOUT_TIMEOUT_MS = 10 * 60 * 1000; // 10분
const ACTIVITY_THROTTLE_MS = 1000;

/** 자동 로그아웃 후 안내 토스트를 띄우기 위한 콜백 URL (NoticeToast가 notice=auto_logout 를 해석) */
const AUTO_LOGOUT_CALLBACK_URL = "/?notice=auto_logout";

const ACTIVITY_EVENTS = ["mousemove", "keydown", "scroll", "click", "touchstart"] as const;

/** 클라이언트에서 접근 가능한(non-httpOnly) 쿠키 만료 처리 */
function clearAccessibleCookies() {
  try {
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0]?.trim();
      if (!name) return;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  } catch {
    /* noop */
  }
}

/**
 * 로그인(세션 존재) 상태에서만 동작하는 전역 미활동 자동 로그아웃 가드.
 * - 기존 소셜 로그인/NextAuth 내부 로직은 일절 수정하지 않고, 브라우저 단에서 활동을 감지해
 *   일정 시간 무활동 시 next-auth 의 signOut() 을 호출하는 상위 래퍼/훅 형태로만 구현.
 */
export function IdleLogoutGuard() {
  const { status } = useSession();
  const timerRef = useRef<number | null>(null);
  const lastResetRef = useRef<number>(0);
  const loggingOutRef = useRef<boolean>(false);

  useEffect(() => {
    // 로그인 상태가 아닐 때는 감시하지 않음
    if (status !== "authenticated") return;

    const logoutForInactivity = async () => {
      if (loggingOutRef.current) return;
      loggingOutRef.current = true;

      // 브라우저 저장소/쿠키 정리 (httpOnly 인증 쿠키는 signOut 이 서버에서 처리)
      try {
        window.localStorage.clear();
      } catch {
        /* noop */
      }
      try {
        window.sessionStorage.clear();
      } catch {
        /* noop */
      }
      clearAccessibleCookies();

      // 기존 소셜 로그아웃 함수 호출 → 로그인 화면("/")으로 강제 이동 + 안내 토스트 노출
      await signOut({ callbackUrl: AUTO_LOGOUT_CALLBACK_URL, redirect: true });
    };

    const armTimer = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        void logoutForInactivity();
      }, IDLE_LOGOUT_TIMEOUT_MS);
    };

    const onActivity = () => {
      const now = Date.now();
      if (now - lastResetRef.current < ACTIVITY_THROTTLE_MS) return;
      lastResetRef.current = now;
      armTimer();
    };

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, onActivity, { passive: true })
    );
    armTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity));
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [status]);

  return null;
}
