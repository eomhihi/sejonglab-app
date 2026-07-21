import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardX } from "lucide-react";
import { SejongLogoLockup } from "@/components/brand/SejongLogoLockup";

export const metadata: Metadata = {
  title: "설문 종료 안내 | 세종랩",
  description: "설문조사 대상에 해당하지 않아 설문이 종료되었습니다. 세종랩 패널 가입을 안내합니다.",
};

/** SejongHeroSection `[패널 신청하기]` 버튼과 동일한 크기·패딩·모서리 비율 */
const PANEL_CTA_BTN =
  "btn btn-lg font-extrabold shadow-lg hover:-translate-y-0.5 font-display inline-flex items-center justify-center gap-2 border-2 box-border border-transparent bg-[#124559] text-white hover:bg-[#598392] transition-all duration-300 shadow-xl";

export default function ScreeningOutPage() {
  return (
    <main
      className="h-screen w-full flex flex-col bg-[#01161e] px-4 sm:px-6 k-keep break-keep [word-break:keep-all]"
      style={{ wordBreak: "keep-all" }}
    >
      <header className="flex shrink-0 justify-center pt-8 sm:pt-10">
        <SejongLogoLockup variant="footer" href="/" exportScale={2} />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center w-full max-w-lg mx-auto text-center">
        <ClipboardX
          className="mb-6 h-12 w-12 text-[#598392] sm:h-14 sm:w-14"
          strokeWidth={1.5}
          aria-hidden
        />

        <p className="mb-3 text-sm font-medium text-gray-400 sm:text-base">
          귀하(기관)은 본 설문조사 대상에 해당하지 않아 설문이 종료되었습니다.
        </p>

        <p className="mb-8 text-xl font-bold leading-snug text-white sm:text-2xl">
          귀중한 시간을 내어 참여해 주셔서 진심으로 감사드립니다.
        </p>

        <p className="mb-10 whitespace-pre-line text-center text-base font-normal text-gray-300 sm:text-lg">
          {`세종시를 위한 더 많은 의견을 나누고 싶으시다면,\n세종랩 패널에 가입해 보세요!`}
        </p>

        <Link href="/signup" className={PANEL_CTA_BTN}>
          세종랩 패널 신청하기
          <ArrowRight className="h-6 w-6" aria-hidden />
        </Link>

        <Link
          href="/"
          className="mt-8 text-sm sm:text-base text-gray-500 underline underline-offset-2 transition-colors hover:text-gray-300"
        >
          세종랩 메인 홈으로 이동
        </Link>
      </div>
    </main>
  );
}
