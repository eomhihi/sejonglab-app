import { MessageSquareHeart, ShieldCheck, Smartphone, Gift } from "lucide-react";

export function BenefitsSection() {
  const benefits = [
    {
      Icon: MessageSquareHeart,
      title: "의견 반영",
      description: "설문 참여를 통해 세종시 정책·서비스 개선에 직접 기여할 수 있습니다.",
      iconBg: "bg-gradient-to-br from-[#004B8D] to-sky-400",
    },
    {
      Icon: ShieldCheck,
      title: "안전한 참여",
      description: "개인정보는 보호되며, 에어봇 클라우드로 안전하게 관리됩니다.",
      iconBg: "bg-gradient-to-br from-sky-500 to-sky-400",
    },
    {
      Icon: Smartphone,
      title: "편리한 진행",
      description: "온라인 설문으로 시간과 장소에 구애받지 않고 참여할 수 있습니다.",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-400",
    },
  ];

  return (
    <section id="benefits" className="py-16 sm:py-24 bg-gradient-to-b from-white to-sky-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#004B8D]/10 rounded-full mb-4">
            <Gift className="w-4 h-4 text-[#004B8D]" />
            <span className="text-sm font-bold text-[#004B8D]">참여 혜택</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#002D56] mb-4 drop-shadow-sm">
            패널 참여 <span className="text-emerald-600">혜택</span>
          </h2>
          <p className="text-base sm:text-lg text-[#002D56] font-medium max-w-xl mx-auto">
            세종시민 패널로 참여하시면 아래와 같은 혜택이 있습니다
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center hover:border-[#004B8D]/30 hover:shadow-xl hover:shadow-[#004B8D]/10 transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-2xl ${benefit.iconBg} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                <benefit.Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#002D56] mb-3 group-hover:text-[#004B8D] transition-colors drop-shadow-sm">
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
