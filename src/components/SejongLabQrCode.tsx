"use client";

import { QRCodeSVG } from "qrcode.react";

export const SEJONG_LAB_SITE_URL = "https://sejonglab.com";

const QR_SIZE = 200;

type SejongLabQrCodeProps = {
  /** QR 코드 한 변 길이(px). 기본 200 */
  size?: number;
  className?: string;
  /** 하단 URL·안내 문구 표시 여부 */
  showCaption?: boolean;
};

export function SejongLabQrCode({
  size = QR_SIZE,
  className = "",
  showCaption = true,
}: SejongLabQrCodeProps) {
  return (
    <div className={`inline-flex flex-col items-center ${className}`.trim()}>
      <div
        className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200/80"
        style={{ width: size + 24, height: size + 24 }}
      >
        <QRCodeSVG
          value={SEJONG_LAB_SITE_URL}
          size={size}
          level="M"
          marginSize={4}
          bgColor="#ffffff"
          fgColor="#124559"
          title={`세종랩 사이트 QR 코드 (${SEJONG_LAB_SITE_URL})`}
        />
      </div>
      {showCaption && (
        <>
          <p className="mt-3 text-xs font-medium text-slate-600 tabular-nums">{SEJONG_LAB_SITE_URL}</p>
          <p className="mt-1 text-xs text-gray-500 text-center">
            스마트폰 카메라로 스캔하면 세종랩 사이트로 이동합니다.
          </p>
        </>
      )}
    </div>
  );
}
