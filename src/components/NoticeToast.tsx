"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const NOTICE_MESSAGES: Record<string, string> = {
  already_member: "이미 가입된 회원입니다.",
  auto_logout: "안전을 위해 일정 시간 동안 활동이 없어 자동 로그아웃되었습니다.",
};

/** notice 키별 노출 시간(ms). 미지정 시 기본값 사용 */
const NOTICE_DURATION_MS: Record<string, number> = {
  auto_logout: 5000,
};
const DEFAULT_NOTICE_DURATION_MS = 2500;

export function NoticeToast() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const noticeKey = searchParams.get("notice") ?? "";
  const message = useMemo(() => NOTICE_MESSAGES[noticeKey] ?? "", [noticeKey]);

  useEffect(() => {
    if (!message) return;
    setOpen(true);
    const duration = NOTICE_DURATION_MS[noticeKey] ?? DEFAULT_NOTICE_DURATION_MS;
    const t = window.setTimeout(() => setOpen(false), duration);
    return () => window.clearTimeout(t);
  }, [message, noticeKey, pathname]);

  if (!open || !message) return null;

  return (
    <div className="fixed left-1/2 top-4 z-[200] -translate-x-1/2 px-4">
      <div className="rounded-xl bg-header-footer text-white text-sm font-semibold shadow-lg px-4 py-3 border border-white/10">
        {message}
      </div>
    </div>
  );
}

