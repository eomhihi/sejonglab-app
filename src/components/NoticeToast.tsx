"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const NOTICE_MESSAGES: Record<string, string> = {
  already_member: "이미 가입된 회원입니다.",
};

export function NoticeToast() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const message = useMemo(() => {
    const key = searchParams.get("notice") ?? "";
    return NOTICE_MESSAGES[key] ?? "";
  }, [searchParams]);

  useEffect(() => {
    if (!message) return;
    setOpen(true);
    const t = window.setTimeout(() => setOpen(false), 2500);
    return () => window.clearTimeout(t);
  }, [message, pathname]);

  if (!open || !message) return null;

  return (
    <div className="fixed left-1/2 top-4 z-[200] -translate-x-1/2 px-4">
      <div className="rounded-xl bg-header-footer text-white text-sm font-semibold shadow-lg px-4 py-3 border border-white/10">
        {message}
      </div>
    </div>
  );
}

