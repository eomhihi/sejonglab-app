"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

type SejongLogoLockupVariant = "topbar" | "footer";

type SejongLogoLockupProps = {
  variant: SejongLogoLockupVariant;
  href?: string;
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function SejongLogoLockup({ variant, href, className }: SejongLogoLockupProps) {
  const topRef = useRef<HTMLElement | null>(null);
  const bottomRef = useRef<HTMLSpanElement | null>(null);
  const [scaleX, setScaleX] = useState(1);

  const styles = useMemo(() => {
    if (variant === "footer") {
      return {
        wrap: `flex flex-col items-start gap-1.5 ${className ?? ""}`.trim(),
        top: "text-white text-base font-extrabold tracking-[0.22em] uppercase font-display",
        bottom:
          "inline-block text-[5.4px] sm:text-[6px] text-slate-500 font-bold tracking-[0.18em] font-display",
      };
    }

    return {
      wrap: `flex flex-col items-start shrink-0 w-max ${className ?? ""}`.trim(),
      top: "inline-flex items-center text-[15px] sm:text-base font-extrabold tracking-[0.22em] uppercase text-black font-display",
      bottom:
        "mt-0.5 inline-block text-[5.4px] sm:text-[6px] font-bold text-gray-500 tracking-[0.18em] font-display",
    };
  }, [variant, className]);

  useLayoutEffect(() => {
    const topEl = topRef.current;
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
  }, [variant]);

  const TopTag = href ? Link : "span";
  const topProps = href ? { href } : {};

  return (
    <div className={styles.wrap}>
      <TopTag
        {...topProps}
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        ref={topRef as never}
        className={styles.top}
      >
        SEJONG LAB
      </TopTag>

      <span
        ref={bottomRef}
        className={styles.bottom}
        style={{ transform: `scaleX(${scaleX})`, transformOrigin: "left" }}
      >
        Research Data
      </span>
    </div>
  );
}

