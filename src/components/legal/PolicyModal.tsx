"use client";

import { useEffect } from "react";

type PolicyModalProps = {
  open: boolean;
  title: string;
  content: string;
  onClose: () => void;
  /** 본문 스크롤 영역 최대 높이 (Tailwind max-h-* 클래스). 기본 max-h-[60vh] */
  bodyMaxHeightClass?: string;
};

export function PolicyModal({
  open,
  title,
  content,
  onClose,
  bodyMaxHeightClass = "max-h-[60vh]",
}: PolicyModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl flex flex-col overflow-hidden break-keep tracking-tight"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-neutral-400 hover:text-neutral-700 transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className={`${bodyMaxHeightClass} overflow-y-auto px-5 py-4`}>
          <p className="whitespace-pre-line text-base leading-relaxed text-neutral-700">{content}</p>
        </div>

        <div className="px-5 py-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-lg bg-neutral-900 text-white font-medium hover:bg-neutral-700 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
