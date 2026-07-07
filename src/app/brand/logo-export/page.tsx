"use client";

import { useCallback, useEffect, useState } from "react";
import { SejongLogoLockup } from "@/components/brand/SejongLogoLockup";

const EXPORT_SCALE = 4;
const LOGO_COUNT = 4;

export default function LogoExportPage() {
  const [readyCount, setReadyCount] = useState(0);
  const [pageReady, setPageReady] = useState(false);

  const handleLayoutReady = useCallback(() => {
    setReadyCount((count) => count + 1);
  }, []);

  useEffect(() => {
    if (readyCount < LOGO_COUNT) return;

    let cancelled = false;
    const finalize = async () => {
      if (typeof document !== "undefined" && "fonts" in document) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (!cancelled) setPageReady(true);
    };

    void finalize();
    return () => {
      cancelled = true;
    };
  }, [readyCount]);

  const exportProps = {
    exportScale: EXPORT_SCALE,
    onLayoutReady: handleLayoutReady,
  } as const;

  return (
    <main className="min-h-screen bg-neutral-100 p-8" data-logo-ready={pageReady ? "true" : "false"}>
      <p className="mb-6 text-sm text-neutral-600">
        로고 PNG 생성용 페이지 · <code>npm run generate:logo</code>
      </p>

      <div className="flex flex-col gap-16 items-start">
        <section aria-label="Dark text logo export">
          <h2 className="mb-2 text-xs font-semibold text-neutral-500">밝은 배경용 (dark text)</h2>
          <div className="flex flex-wrap gap-8 items-start">
            <div id="logo-topbar" className="inline-block bg-white p-6 rounded-lg shadow-sm">
              <SejongLogoLockup variant="topbar" {...exportProps} />
            </div>
            <div id="logo-topbar-transparent" className="inline-block p-6">
              <SejongLogoLockup variant="topbar" {...exportProps} />
            </div>
          </div>
        </section>

        <section aria-label="Light text logo export">
          <h2 className="mb-2 text-xs font-semibold text-neutral-500">어두운 배경용 (light text)</h2>
          <div className="flex flex-wrap gap-8 items-start">
            <div id="logo-footer" className="inline-block bg-header-footer p-6 rounded-lg shadow-sm">
              <SejongLogoLockup variant="footer" {...exportProps} />
            </div>
            <div id="logo-footer-transparent" className="inline-block p-6">
              <SejongLogoLockup variant="footer" {...exportProps} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
