"use client";

import Link from "next/link";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SejongLabWordmark } from "@/components/brand/SejongLabWordmark";

type SejongLogoLockupVariant = "topbar" | "footer";

type SejongLogoLockupProps = {
  variant: SejongLogoLockupVariant;
  href?: string;
  className?: string;
  exportScale?: number;
  onLayoutReady?: () => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function SejongLogoLockup({
  variant,
  href,
  className,
  exportScale = 1,
  onLayoutReady,
}: SejongLogoLockupProps) {
  const topLinkRef = useRef<HTMLAnchorElement | null>(null);
  const topSpanRef = useRef<HTMLSpanElement | null>(null);
  const bottomRef = useRef<HTMLSpanElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wordmarkReadyRef = useRef(false);
  const scaleReadyRef = useRef(false);
  const notifiedRef = useRef(false);
  const [scaleX, setScaleX] = useState(1);
  const [visible, setVisible] = useState(exportScale === 1);

  const markReady = useCallback(() => {
    if (!wordmarkReadyRef.current || !scaleReadyRef.current || notifiedRef.current) return;
    notifiedRef.current = true;
    setVisible(true);
    onLayoutReady?.();
    wrapRef.current?.setAttribute("data-lockup-ready", "true");
  }, [onLayoutReady]);

  const handleWordmarkReady = useCallback(() => {
    wordmarkReadyRef.current = true;
    markReady();
  }, [markReady]);

  const styles = useMemo(() => {
    const isExport = exportScale !== 1;

    if (variant === "footer") {
      return {
        wrap: `flex flex-col items-start gap-[3px] ${className ?? ""}`.trim(),
        wrapStyle: isExport ? { gap: `${3 * exportScale}px` } : undefined,
        top: isExport
          ? "inline-flex items-center text-white font-extrabold uppercase font-display"
          : "inline-flex items-center text-white text-lg font-extrabold uppercase font-display",
        topStyle: isExport ? { fontSize: `${18 * exportScale}px` } : undefined,
        bottom: isExport
          ? "inline-block font-bold tracking-[0.18em] font-display text-[#bfbfbf]"
          : "inline-block text-[6.1px] sm:text-[6.75px] font-bold tracking-[0.18em] font-display text-[#bfbfbf]",
        bottomStyle: isExport
          ? { fontSize: `${6.75 * exportScale}px` }
          : undefined,
      };
    }

    return {
      wrap: `flex flex-col items-start shrink-0 w-max ${className ?? ""}`.trim(),
      wrapStyle: isExport ? { gap: `${1 * exportScale}px` } : undefined,
      top: isExport
        ? "inline-flex items-center font-extrabold uppercase text-header-footer font-display"
        : "inline-flex items-center text-base sm:text-lg font-extrabold uppercase text-header-footer font-display",
      topStyle: isExport ? { fontSize: `${18 * exportScale}px` } : undefined,
      bottom: isExport
        ? "inline-block font-bold tracking-[0.18em] font-display text-[#bfbfbf]"
        : "mt-px inline-block text-[5.75px] sm:text-[6.75px] font-bold tracking-[0.18em] font-display text-[#bfbfbf]",
      bottomStyle: isExport
        ? { fontSize: `${6.75 * exportScale}px` }
        : undefined,
    };
  }, [variant, className, exportScale]);

  useLayoutEffect(() => {
    const topEl = href ? topLinkRef.current : topSpanRef.current;
    const bottomEl = bottomRef.current;
    if (!topEl || !bottomEl) return;

    let raf = 0;
    const recalc = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const topW = topEl.offsetWidth;
        const bottomW = bottomEl.offsetWidth;
        if (!topW || !bottomW) return;
        setScaleX(clamp(topW / bottomW, 0.5, 3));
        scaleReadyRef.current = true;
        markReady();
      });
    };

    recalc();

    const ro =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            recalc();
          });

    ro?.observe(topEl);
    ro?.observe(bottomEl);
    window.addEventListener("resize", recalc);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", recalc);
      ro?.disconnect();
    };
  }, [variant, href, markReady]);

  const topFontClass =
    variant === "footer"
      ? exportScale !== 1
        ? "text-white font-extrabold"
        : "text-white text-lg font-extrabold"
      : exportScale !== 1
        ? "font-extrabold text-header-footer"
        : "text-base sm:text-lg font-extrabold text-header-footer";

  const donutTone = variant === "footer" ? "light" : "dark";

  const topLine = (
    <SejongLabWordmark
      tone={donutTone}
      fontClassName={topFontClass}
      onLayoutReady={handleWordmarkReady}
    />
  );

  const wrapClassName = styles.wrap;

  return (
    <div
      ref={wrapRef}
      className={wrapClassName}
      style={{
        ...styles.wrapStyle,
        visibility: visible ? "visible" : "hidden",
      }}
      data-lockup-ready="false"
    >
      {href ? (
        <Link
          href={href}
          ref={topLinkRef}
          className={styles.top}
          style={styles.topStyle}
        >
          {topLine}
        </Link>
      ) : (
        <span ref={topSpanRef} className={styles.top} style={styles.topStyle}>
          {topLine}
        </span>
      )}

      <span
        ref={bottomRef}
        className={styles.bottom}
        style={{
          ...styles.bottomStyle,
          transform: `scaleX(${scaleX})`,
          transformOrigin: "left",
        }}
      >
        Research Data
      </span>
    </div>
  );
}
