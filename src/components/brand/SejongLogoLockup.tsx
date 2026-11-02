"use client";

import Link from "next/link";
import { useEffect } from "react";

type SejongLogoLockupVariant = "topbar" | "footer";

type SejongLogoLockupProps = {
  variant: SejongLogoLockupVariant;
  href?: string;
  className?: string;
  exportScale?: number;
  onLayoutReady?: () => void;
};

export function SejongLogoLockup({
  variant,
  href,
  className = "",
  exportScale = 1,
  onLayoutReady,
}: SejongLogoLockupProps) {
  useEffect(() => {
    onLayoutReady?.();
  }, [onLayoutReady]);

  const isFooter = variant === "footer";
  const logoSrc = isFooter
    ? "/brand/sejong-logo-light-text-transparent.png"
    : "/brand/sejong-logo-dark-text-transparent.png";

  const heightPx = isFooter ? 36 * exportScale : 42 * exportScale;

  const content = (
    <div
      className={`inline-flex items-center ${className}`.trim()}
      data-lockup-ready="true"
    >
      <img
        src={logoSrc}
        alt="SEJONG LAB Research Data"
        style={{ height: `${heightPx}px` }}
        className="w-auto object-contain"
        onLoad={() => onLayoutReady?.()}
      />
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label="세종랩 홈으로 이동"
        className="inline-flex items-center hover:opacity-90 transition-opacity shrink-0"
      >
        {content}
      </Link>
    );
  }

  return content;
}

