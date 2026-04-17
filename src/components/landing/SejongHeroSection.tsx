import { EungBridgeGraphic, SejongBackground } from "./SejongBackground";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SejongHeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-white via-sky-50/30 to-mint-50/20 overflow-hidden">
      <SejongBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 sm:pt-14 pb-12 sm:pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* 좌측 텍스트 */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sejong-blue/10 rounded-full mb-6">
              <span className="w-2 h-2 bg-mint-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-sejong-blue drop-shadow-sm k-keep">
                세종시 스마트 시티 & 데이터 리서치
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6 drop-shadow-sm">
              <span className="text-sejong-blue font-display">세종의 미래</span>
              <span className="text-slate-900">를</span>
              <br />
              <span className="text-sejong-blue font-display">데이터로 설계</span>
              <span className="text-slate-900">합니다</span>
            </h1>

            <p className="text-base sm:text-lg text-primary-800 font-medium mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed drop-shadow-sm k-keep">
              세종시민의 목소리를 데이터로 담아,<br />
              더 나은 정책과 서비스를 만들어갑니다.<br />
              시민 패널로 참여하여 우리 도시의 변화를 함께 이끌어 주세요.
            </p>

            <div className="flex justify-center lg:justify-start">
              <Link
                href="/signup"
                className="btn btn-primary btn-lg font-extrabold shadow-lg hover:-translate-y-0.5 font-display"
              >
                패널 신청하기
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-300/50">
              <div className="text-center lg:text-left">
                <p className="text-2xl sm:text-3xl font-extrabold text-sejong-blue drop-shadow-sm">세계 최초</p>
                <p className="text-xs sm:text-sm text-[#002D56] font-medium">스마트시티 국제인증(Lv.4)</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-2xl sm:text-3xl font-extrabold text-sejong-blue drop-shadow-sm">최우수</p>
                <p className="text-xs sm:text-sm text-[#002D56] font-medium">
                  데이터기반행정 평가 <br className="hidden sm:block" /> (3년 연속)
                </p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-2xl sm:text-3xl font-extrabold text-sejong-blue drop-shadow-sm">1,500만+</p>
                <p className="text-xs sm:text-sm text-[#002D56] font-medium">
                  스마트 모빌리티 어울링 <br className="hidden sm:block" /> 누적 이용
                </p>
              </div>
            </div>
          </div>

          {/* 우측 그래픽 */}
          <div className="order-1 lg:order-2">
            <div className="flex flex-col items-center">
              <EungBridgeGraphic />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
