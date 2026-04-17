import { Building2, Leaf, BarChart3, MapPin, Users, Sparkles } from "lucide-react";

const features = [
  {
    icon: Building2,
    iconBg: "bg-white border border-brand-ash/60",
    iconColor: "text-sejong-blue",
    title: "세종시 행정동별 정밀 분석",
    description: "31개 행정동의 특성을 반영한 맞춤형 설문과 데이터 분석으로 지역별 정책 수요를 파악합니다.",
    landmark: "세종정부청사",
    features: ["지역 맞춤 설문", "행정동별 비교 분석", "실시간 데이터 대시보드"],
  },
  {
    icon: Users,
    iconBg: "bg-white border border-brand-ash/60",
    iconColor: "text-sejong-blue",
    title: "시민 체감도 조사",
    description: "교통, 교육, 복지 등 생활 밀착형 정책에 대한 시민들의 실제 만족도와 개선 요구를 수집합니다.",
    landmark: "이응다리",
    features: ["다양한 설문 방식", "익명성 보장", "빠른 피드백 반영"],
  },
  {
    icon: Sparkles,
    iconBg: "bg-white border border-brand-ash/60",
    iconColor: "text-brand-secondary",
    title: "신사업 실증 데이터",
    description: "자율주행, 드론배송 등 스마트시티 신기술에 대한 시민 수용성과 니즈를 조사합니다.",
    landmark: "국립세종도서관",
    features: ["미래 기술 수용성 조사", "실증 사업 참여", "혁신 서비스 우선 체험"],
  },
];

export function SejongFeatureCards() {
  return (
    <section id="services" className="py-16 sm:py-24 bg-gradient-to-b from-white to-brand-light/55">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-light rounded-full mb-4 border border-brand-ash/60">
            <BarChart3 className="w-4 h-4 text-sejong-blue" />
            <span className="text-sm font-bold text-sejong-blue">핵심 서비스</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#002D56] mb-4 drop-shadow-sm">
            <span className="text-sejong-blue">데이터 기반</span> 시민 참여 플랫폼
          </h2>
          <p className="text-[#002D56] font-medium max-w-2xl mx-auto">
            세종시의 특성을 반영한 맞춤형 리서치로 더 나은 도시를 만들어갑니다
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-sejong-blue/5 hover:border-sejong-blue/20 transition-all duration-300 hover:-translate-y-1"
            >
              {/* 아이콘 */}
              <div className={`inline-flex items-center justify-center w-14 h-14 ${feature.iconBg} rounded-xl mb-5`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>

              {/* 랜드마크 태그 */}
              <div className="absolute top-6 right-6 flex items-center gap-1 text-xs text-slate-500 font-medium">
                <MapPin className="w-3 h-3" />
                <span>{feature.landmark}</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-[#002D56] mb-3 group-hover:text-sejong-blue transition-colors drop-shadow-sm">
                {feature.title}
              </h3>

              <p className="text-[#002D56] text-sm sm:text-base mb-5 leading-relaxed font-medium">
                {feature.description}
              </p>

              {/* 기능 리스트 */}
              <ul className="space-y-2">
                {feature.features.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                    <Leaf className="w-4 h-4 text-brand-secondary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* 하단 그라디언트 바 */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sejong-blue via-brand-secondary to-brand-ash rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
