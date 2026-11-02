"use client";

import Link from "next/link";

type SejongCompanyLogoProps = {
  href?: string;
  className?: string;
  variant?: "dark" | "light";
};

export function SejongCompanyLogo({
  href = "/",
  className = "",
  variant = "dark",
}: SejongCompanyLogoProps) {
  const logoSrc =
    variant === "light"
      ? "/brand/sejong-logo-light-text-transparent.png"
      : "/brand/sejong-logo-dark-text-transparent.png";

  const content = (
    <div className={`inline-flex items-center ${className}`.trim()}>
      <img
        src={logoSrc}
        alt="SEJONG LAB Research Data"
        className="h-10 sm:h-12 w-auto object-contain"
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

