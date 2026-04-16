import Link from "next/link";

/** 고정 로고 바 높이: Tailwind `h-14` (3.5rem)과 동기화 */
export const TOP_LOGO_BAR_HEIGHT_CLASS = "h-14" as const;

export function TopLogoBar() {
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[80] ${TOP_LOGO_BAR_HEIGHT_CLASS} flex items-center bg-white/65 backdrop-blur-md border-b border-slate-200/40`}
    >
      <div className="max-w-7xl mx-auto w-full px-4">
        <Link
          href="/"
          className="inline-flex items-center text-[15px] sm:text-base font-extrabold tracking-[0.22em] uppercase text-[#0047AB]"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          SEJONG LAB
        </Link>
      </div>
    </div>
  );
}
