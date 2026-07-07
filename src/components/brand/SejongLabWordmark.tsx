"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { SejongDonutLetterO } from "@/components/brand/SejongDonutLetterO";

const TRACKING = "0.22em";
const SEJONG_GAP_COUNT = 5;
const WORD_GAP_CHAR_RATIO = 0.3;

type SejongLabWordmarkProps = {
  tone: "dark" | "light";
  fontClassName: string;
  onLayoutReady?: () => void;
};

const measureClass =
  "pointer-events-none fixed left-[-10000px] top-0 whitespace-nowrap invisible select-none";

function measureOGlyphSize(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const font = [
    style.fontStyle,
    style.fontVariant,
    style.fontWeight,
    style.fontSize,
    style.fontFamily,
  ].join(" ");

  ctx.font = font;
  const metrics = ctx.measureText("O");
  const inkW = metrics.width;
  const inkH =
    (metrics.actualBoundingBoxAscent || parseFloat(style.fontSize) * 0.72) +
    (metrics.actualBoundingBoxDescent || parseFloat(style.fontSize) * 0.04);

  return Math.max(inkW, inkH);
}

export function SejongLabWordmark({ tone, fontClassName, onLayoutReady }: SejongLabWordmarkProps) {
  const sejongMeasureRef = useRef<HTMLSpanElement>(null);
  const charMeasureRef = useRef<HTMLSpanElement>(null);
  const sejongGroupRef = useRef<HTMLSpanElement>(null);
  const labGroupRef = useRef<HTMLSpanElement>(null);
  const oGhostRef = useRef<HTMLSpanElement>(null);
  const readySentRef = useRef(false);
  const [letterGap, setLetterGap] = useState("0px");
  const [wordGap, setWordGap] = useState("0px");
  const [donutSize, setDonutSize] = useState<number | null>(null);
  const [layoutReady, setLayoutReady] = useState(false);

  const glyphClass = `${fontClassName} uppercase font-display leading-none`;

  useLayoutEffect(() => {
    const sejongMeasure = sejongMeasureRef.current;
    const charMeasure = charMeasureRef.current;
    const sejongGroup = sejongGroupRef.current;
    const labGroup = labGroupRef.current;
    const oGhost = oGhostRef.current;
    if (!sejongMeasure || !charMeasure || !sejongGroup || !labGroup || !oGhost) {
      return;
    }

    let raf = 0;
    const recalc = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const oInk = measureOGlyphSize(oGhost);
        if (oInk) setDonutSize(oInk);

        const sejongTargetW = sejongMeasure.offsetWidth;
        if (!sejongTargetW) return;

        sejongGroup.style.gap = "0px";
        labGroup.style.gap = "0px";
        const sejongContentW = sejongGroup.offsetWidth;
        const letterGapPx = Math.max(0, (sejongTargetW - sejongContentW) / SEJONG_GAP_COUNT);

        const charW = charMeasure.offsetWidth;
        const wordGapPx = charW * WORD_GAP_CHAR_RATIO;

        setLetterGap(`${letterGapPx}px`);
        setWordGap(`${wordGapPx}px`);
        setLayoutReady(true);

        if (!readySentRef.current) {
          readySentRef.current = true;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              onLayoutReady?.();
            });
          });
        }
      });
    };

    recalc();

    const ro =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            recalc();
          });

    ro?.observe(sejongMeasure);
    ro?.observe(charMeasure);
    ro?.observe(sejongGroup);
    ro?.observe(labGroup);
    window.addEventListener("resize", recalc);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", recalc);
      ro?.disconnect();
    };
  }, [fontClassName, tone, onLayoutReady]);

  return (
    <span
      className="relative inline-flex shrink-0 items-center"
      style={{ visibility: layoutReady ? "visible" : "hidden" }}
    >
      <span
        ref={sejongMeasureRef}
        aria-hidden
        className={`${glyphClass} ${measureClass}`}
        style={{ letterSpacing: TRACKING }}
      >
        SEJONG
      </span>

      <span ref={charMeasureRef} aria-hidden className={`${glyphClass} ${measureClass}`}>
        N
      </span>

      <span
        ref={sejongGroupRef}
        className={`${glyphClass} inline-flex items-center tracking-normal`}
        style={{ gap: letterGap }}
      >
        <span aria-hidden>S</span>
        <span aria-hidden>E</span>
        <span aria-hidden>J</span>
        <span className="relative inline-flex shrink-0 items-center justify-center">
          <span ref={oGhostRef} className="invisible select-none" aria-hidden>
            O
          </span>
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <SejongDonutLetterO
              tone={tone}
              style={
                donutSize
                  ? { width: `${donutSize}px`, height: `${donutSize}px` }
                  : undefined
              }
            />
          </span>
        </span>
        <span aria-hidden>N</span>
        <span aria-hidden>G</span>
      </span>

      <span aria-hidden className="inline-block shrink-0" style={{ width: wordGap }} />

      <span
        ref={labGroupRef}
        className={`${glyphClass} inline-flex items-center tracking-normal`}
        style={{ gap: letterGap }}
      >
        <span aria-hidden>L</span>
        <span aria-hidden>A</span>
        <span aria-hidden>B</span>
      </span>
    </span>
  );
}
