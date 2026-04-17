import { MessageSquareHeart, Smartphone, Gift, Coffee } from "lucide-react";

export function BenefitsSection() {
  const benefits = [
    {
      Icon: MessageSquareHeart,
      title: "의견 반영",
      description: "설문 참여를 통해 세종시 정책·서비스 개선에 직접 기여할 수 있습니다.",
      iconBg: "bg-white border-2 border-brand-ash/70",
      iconColor: "text-brand-ash",
    },
    {
      Icon: Coffee,
      title: "참여 보상",
      description:
        "설문조사에 참여해 주신 분들께는 감사의 의미를 담아 커피 쿠폰 등 리워드를 제공합니다.",
      iconBg: "bg-white border-2 border-brand-ash/70",
      iconColor: "text-brand-ash",
    },
    {
      Icon: Smartphone,
      title: "편리한 진행",
      description: "온라인 설문으로 시간과 장소에 구애받지 않고 참여할 수 있습니다.",
      iconBg: "bg-white border-2 border-brand-ash/70",
      iconColor: "text-brand-ash",
    },
  ];

  return (
    <section id="benefits" className="py-16 sm:py-24 bg-gradient-to-b from-white to-brand-light/55">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-light rounded-full mb-4 border border-brand-ash/60">
            <Gift className="w-4 h-4 text-sejong-blue" />
            <span className="text-sm font-bold text-sejong-blue">참여 혜택</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#002D56] mb-4 drop-shadow-sm">
            패널 참여 혜택
          </h2>
          <p className="text-base sm:text-lg text-[#002D56] font-medium max-w-xl mx-auto">
            세종시민 패널로 참여하시면 아래와 같은 혜택이 있습니다
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-sejong-blue/5 hover:border-sejong-blue/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`inline-flex items-center justify-center w-14 h-14 ${benefit.iconBg} rounded-xl mb-5`}
              >
                <benefit.Icon className={`w-7 h-7 ${benefit.iconColor}`} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#002D56] mb-3 group-hover:text-sejong-blue transition-colors drop-shadow-sm">
                {benefit.title}
              </h3>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
