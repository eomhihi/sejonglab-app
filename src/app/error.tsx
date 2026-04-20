"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-lg font-semibold text-slate-900 mb-2">페이지를 불러오지 못했습니다</h1>
      <p className="text-slate-600 text-sm max-w-md mb-6 leading-relaxed">
        일시적인 오류일 수 있습니다. 잠시 후 다시 시도해 주세요.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-sejong-blue text-white text-sm font-semibold hover:brightness-110 transition"
      >
        다시 시도
      </button>
    </div>
  );
}
