import type { LucideIcon } from "lucide-react";
import { LineChart, Home, Bus, Palette, Landmark, Users } from "lucide-react";
import { sejongLabIndexes } from "@/lib/sejong-lab-indexes";

const ICON_BOX = "bg-white border-2 border-brand-secondary/70";
const ICON_COLOR = "text-brand-secondary";

const INDEX_ICONS: Record<string, LucideIcon> = {
  "삶의 질 지수": Home,
  "교통 만족 지수": Bus,
  "문화·여가 지수": Palette,
  "정책 체감 지수": Landmark,
  "정주 의향 지수": Users,
};

const CARD_CLASS =
  "group relative w-full md:w-[calc(33.333%-16px)] lg:w-[calc(33.333%-16px)] flex-grow-0 flex-shrink-0 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 text-left hover:shadow-xl hover:shadow-sejong-blue/5 hover:border-sejong-blue/20 transition-all duration-300 hover:-translate-y-1";

export function SejongIndexSection() {
  return (
    <section id="sejong-index" className="py-16 sm:py-24 bg-gradient-to-b from-brand-light/55 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-light rounded-full mb-4 border border-brand-ash/60">
            <LineChart className="w-4 h-4 text-sejong-blue" />
            <span className="text-sm font-bold text-sejong-blue">세종지수 개발</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#002D56] mb-4 drop-shadow-sm">
            데이터로 측정하는 세종의 미래, 5대 세종지수
          </h2>
          <p className="text-base sm:text-lg text-[#002D56] font-medium max-w-2xl mx-auto">
            세종랩은 지역 생활 만족도, 행정 접근성, 주거, 교통, 교육, 문화 등을 종합한 고유의 데이터 지표를
            개발하여 정기 추적 조사를 수행할 예정입니다.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto mt-10">
          {sejongLabIndexes.map((index) => {
            const Icon = INDEX_ICONS[index.title] ?? LineChart;

            return (
              <article key={index.title} className={CARD_CLASS}>
                <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-light border border-brand-ash/60 text-[11px] font-bold text-sejong-blue">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" />
                  준비 중
                </span>
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 ${ICON_BOX} rounded-xl mb-5`}
                >
                  <Icon className={`w-7 h-7 ${ICON_COLOR}`} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#002D56] mb-3 group-hover:text-sejong-blue transition-colors drop-shadow-sm">
                  {index.title}
                </h3>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium break-keep k-keep">
                  {index.desc}
                </p>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sejong-blue via-brand-secondary to-brand-ash rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
