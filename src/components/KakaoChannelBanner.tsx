import Image from "next/image";

export const SEJONG_LAB_KAKAO_CHANNEL_URL = "https://pf.kakao.com/_xdwtpG";

const BANNER_WIDTH = 774;
const BANNER_HEIGHT = 414;

export function KakaoChannelBanner() {
  return (
    <div className="w-full max-w-xl mx-auto">
      <a
        href={SEJONG_LAB_KAKAO_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block cursor-pointer rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-200/80 transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-sejong-blue focus-visible:ring-offset-2"
        aria-label="세종랩 카카오톡 채널 친구 추가 페이지로 이동 (새 창)"
      >
        <Image
          src="/images/kakao-ch-banner.png"
          alt="세종랩 카카오톡 채널 친구 추가 — Airbbot 채널 추가하고 맞춤형 설문 받아보세요"
          width={BANNER_WIDTH}
          height={BANNER_HEIGHT}
          className="w-full h-auto"
          sizes="(max-width: 640px) 100vw, 576px"
          priority
        />
      </a>
      <p className="text-xs text-gray-500 mt-2 text-center">
        화면을 클릭하시면 세종랩 카카오톡 채널 친구 추가 화면으로 이동합니다.
      </p>
    </div>
  );
}
