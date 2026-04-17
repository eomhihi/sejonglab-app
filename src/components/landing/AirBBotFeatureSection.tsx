import { FileText, Send, Database, PieChart, Cloud } from "lucide-react";

export function AirBBotFeatureSection() {
  const steps = [
    {
      title: "설문 설계",
      description: "클라우드에서 설문지를 쉽게 설계하고 수정합니다.",
      Icon: FileText,
    },
    {
      title: "배포·수집",
      description: "패널 대상으로 설문을 배포하고 응답을 실시간으로 수집합니다.",
      Icon: Send,
    },
    {
      title: "데이터 관리",
      description: "응답 데이터를 안전하게 저장하고 통합 관리합니다.",
      Icon: Database,
    },
    {
      title: "리포트",
      description: "분석 결과를 리포트로 생성해 정책·서비스 개선에 활용합니다.",
      Icon: PieChart,
    },
  ];

  return (
    <section id="airbot" className="py-16 sm:py-24 bg-gradient-to-b from-brand-light/45 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-light rounded-full mb-4 border border-brand-ash/60">
            <Cloud className="w-4 h-4 text-sejong-blue" />
            <span className="text-sm font-bold text-sejong-blue">AirBBot 플랫폼</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#002D56] mb-4 drop-shadow-sm">
            에어봇(<span className="text-sejong-blue">AirBBot</span>) 솔루션
          </h2>
          <p className="text-base sm:text-lg text-[#002D56] font-medium max-w-2xl mx-auto">
            <span className="font-bold text-sejong-blue">클라우드 기반 설문 설계부터 리포트까지</span>
            <br />
            한 곳에서 통합 관리하는 플랫폼
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-sejong-blue/5 hover:border-sejong-blue/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 bg-white border border-brand-ash/60 rounded-xl mb-5`}>
                <step.Icon className="w-7 h-7 text-sejong-blue" />
              </div>
              <div className="absolute top-6 right-6 flex items-center gap-1 text-xs text-slate-500 font-medium">
                <span>STEP {i + 1}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#002D56] mb-2 group-hover:text-sejong-blue transition-colors drop-shadow-sm">
                {step.title}
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed font-medium">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 sm:mt-14 rounded-2xl bg-brand-light border border-brand-ash/60 p-6 sm:p-10 text-center">
          <p className="text-header-footer text-sm font-bold mb-2">
            통합 관리의 장점
          </p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold max-w-2xl mx-auto leading-relaxed text-header-footer">
            설문 설계 → 배포 → 수집 → 분석 → 리포트까지{" "}
            <br className="hidden sm:block" />
            클라우드 하나로 안전하고 투명하게 운영됩니다.
          </p>
        </div>
      </div>
    </section>
  );
}
