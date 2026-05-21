"use client";

import { QRCodeSVG } from "qrcode.react";
import { SEJONG_LAB_SITE_URL } from "@/lib/sejonglab-url";

/** 동심원 코어 내 QR — 스캔 인식률 우선 (로고·이미지 없음) */
const QR_SIZE = 58;
const POLICY_COLOR = "#002D56";

export function EungBridgeGraphic() {
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

        {/* 중앙 라이트 그레이 코어 */}
        <circle cx="150" cy="150" r="60" fill="#f1f5f9" opacity="0.98" />
        <circle cx="150" cy="150" r="60" fill="url(#inner-gradient)" opacity="0.06" />

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
          <radialGradient id="inner-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="var(--color-primary)" />
          </radialGradient>
        </defs>
      </svg>

      {/* 중앙 코어: 텍스트 + 실시간 QR (수직 스택) */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-5 sm:px-6 drop-shadow-sm pointer-events-auto"
        aria-label={`세종랩 QR 코드: ${SEJONG_LAB_SITE_URL}`}
      >
        <span className="text-[10px] sm:text-xs font-bold tracking-wider text-sejong-blue shrink-0 leading-tight">
          AI &amp; Data Driven
        </span>

        <div
          className="my-2 sm:my-2.5 shrink-0 rounded-[4px] bg-white p-1 shadow-sm ring-1 ring-slate-200/60"
          title={SEJONG_LAB_SITE_URL}
        >
          <QRCodeSVG
            value={SEJONG_LAB_SITE_URL}
            size={QR_SIZE}
            level="H"
            marginSize={2}
            bgColor="#ffffff"
            fgColor={POLICY_COLOR}
            title={`세종랩 사이트 (${SEJONG_LAB_SITE_URL})`}
          />
        </div>

        <span className="text-base sm:text-xl font-extrabold shrink-0 leading-tight" style={{ color: POLICY_COLOR }}>
          Policy
        </span>
      </div>
    </div>
  );
}
