"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { SEJONG_LAB_SITE_URL } from "@/lib/sejonglab-url";

const POLICY_COLOR = "#002D56";
/** viewBox 300, r=80 대시 링 바운딩 박스 inset */
const DASHED_RING_INSET = "23.333%";

export function EungBridgeGraphic() {
  const qrSlotRef = useRef<HTMLDivElement>(null);
  const [qrSize, setQrSize] = useState(0);

  useEffect(() => {
    const el = qrSlotRef.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      const side = Math.floor(Math.min(width, height));
      if (side > 0) setQrSize(side);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto">
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-hidden
      >
        {/* 바깥 솔리드 블루 gradient 링 */}
        <circle
          cx="150"
          cy="150"
          r="120"
          stroke="url(#bridge-gradient)"
          strokeWidth="8"
          fill="none"
          opacity="0.9"
        />
        <circle
          cx="150"
          cy="150"
          r="100"
          stroke="url(#bridge-gradient-inner)"
          strokeWidth="3"
          fill="none"
          opacity="0.5"
        />
        {/* 안쪽 그레이 대시 링 */}
        <circle
          cx="150"
          cy="150"
          r="80"
          stroke="var(--color-primary)"
          strokeWidth="1"
          fill="none"
          opacity="0.2"
          strokeDasharray="8 4"
        />

        <defs>
          <linearGradient id="bridge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="var(--color-secondary)" />
          </linearGradient>
          <linearGradient id="bridge-gradient-inner" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-secondary)" />
            <stop offset="100%" stopColor="var(--color-primary)" />
          </linearGradient>
        </defs>
      </svg>

      {/* 대시 링 내부: 텍스트 + 확장 QR (중앙 코어 배경 없음 → 히어로 곡선 배경 비침) */}
      <div
        className="absolute flex flex-col items-center justify-center text-center pointer-events-auto gap-1.5 sm:gap-2"
        style={{ inset: DASHED_RING_INSET }}
        aria-label={`세종랩 QR 코드: ${SEJONG_LAB_SITE_URL}`}
      >
        <span className="text-[10px] sm:text-xs font-bold tracking-wider text-sejong-blue shrink-0 leading-tight drop-shadow-sm">
          AI &amp; Data Driven
        </span>

        <div
          ref={qrSlotRef}
          className="flex-1 w-full min-h-0 min-w-0 flex items-center justify-center"
          title={SEJONG_LAB_SITE_URL}
        >
          {qrSize > 0 && (
            <QRCodeSVG
              value={SEJONG_LAB_SITE_URL}
              size={qrSize}
              level="H"
              marginSize={0}
              bgColor="transparent"
              fgColor={POLICY_COLOR}
              title={`세종랩 사이트 (${SEJONG_LAB_SITE_URL})`}
              className="block shrink-0"
            />
          )}
        </div>

        <span
          className="text-base sm:text-xl font-extrabold shrink-0 leading-tight drop-shadow-sm"
          style={{ color: POLICY_COLOR }}
        >
          Policy
        </span>
      </div>
    </div>
  );
}
