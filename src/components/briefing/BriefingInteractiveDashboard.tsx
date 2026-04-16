"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Building2, GraduationCap, Gauge } from "lucide-react";

const DONUT_DATA = [
  { name: "필요", value: 72, fill: "rgb(var(--briefing-chart-accent-rgb) / 1)" },
  { name: "기타", value: 28, fill: "rgb(var(--briefing-chart-track-rgb) / 1)" },
];

const USAGE_SEGMENTS = [1, 1, 1, 0.8, 0];

const STACK_PARTS = [
  { key: "긍정", pct: 68, fill: "rgb(var(--briefing-chart-stack-strong-rgb) / 1)" },
  { key: "보류", pct: 22, fill: "rgb(var(--briefing-chart-stack-mid-rgb) / 0.48)" },
  { key: "부정", pct: 10, fill: "rgb(var(--briefing-chart-stack-muted-rgb) / 1)" },
] as const;

type TabId = "innovation" | "usage" | "education";

const TABS: {
  id: TabId;
  label: string;
  valueLine: string;
  Icon: typeof Building2;
}[] = [
  { id: "innovation", label: "행정 혁신 필요성", valueLine: "72%", Icon: Building2 },
  { id: "usage", label: "현재 AI 활용도", valueLine: "3.8 / 5", Icon: Gauge },
  { id: "education", label: "교육 의향", valueLine: "68%", Icon: GraduationCap },
];

const INSIGHTS: Record<TabId, string> = {
  innovation:
    "응답자 과반이 행정 서비스 혁신에 AI 도입을 필요하다고 인식합니다. 디지털 전환 의지가 정책 우선순위에 반영될 여지가 큽니다.",
  usage:
    "자가 평가 5점 만점에서 3.8로, 일상·업무 맥락의 활용은 확산 단계에 접어들었습니다. 도구 선택과 거버넌스가 다음 과제입니다.",
  education:
    "교육·재교육 참여 의향이 다수를 차지합니다. 역량 강화 프로그램이 수요를 선제적으로 흡수하도록 설계할 수 있습니다.",
};

export type BriefingInteractiveDashboardProps = {
  embedded?: boolean;
};

export function BriefingInteractiveDashboard({ embedded = false }: BriefingInteractiveDashboardProps) {
  const [active, setActive] = useState<TabId>("innovation");

  return (
    <div className="w-full bg-white text-slate-900">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes briefingPanelIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .briefing-panel-animate {
            animation: briefingPanelIn 0.45s ease-out forwards;
          }
        `,
        }}
      />

      {!embedded && (
        <div className="mb-2">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-sejong-blue">Key metrics</p>
          <h3 className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            인터랙티브 데이터 대시보드
          </h3>
        </div>
      )}

      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${embedded ? "mt-0" : "mt-8"}`} role="tablist" aria-label="핵심 지표 선택">
        {TABS.map(({ id, label, valueLine, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(id)}
              className={`flex flex-col items-center justify-center gap-2 px-4 py-5 sm:py-6 text-center transition-colors duration-300 rounded-sm border-0 shadow-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sejong-blue focus-visible:ring-offset-white ${
                isActive ? "bg-sejong-blue text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              <span className="inline-flex items-center gap-2 text-sm sm:text-[15px] font-semibold leading-tight">
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden />
                {label}
              </span>
              <span className="text-lg sm:text-xl font-bold tabular-nums tracking-tight">{valueLine}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 min-h-[380px] sm:min-h-[400px]">
        <div key={active} className="briefing-panel-animate">
          {active === "innovation" && <InnovationPanel />}
          {active === "usage" && <UsagePanel />}
          {active === "education" && <EducationPanel />}
        </div>
      </div>
    </div>
  );
}

function InnovationPanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      <div className="relative mx-auto h-[260px] w-full max-w-[300px] sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={DONUT_DATA}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="78%"
              outerRadius="96%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              stroke="none"
              isAnimationActive
              animationDuration={600}
            >
              {DONUT_DATA.map((entry, i) => (
                <Cell key={i} fill={entry.fill} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" aria-hidden>
          <span className="text-[3.5rem] sm:text-[4.25rem] font-semibold tabular-nums leading-none tracking-tighter text-slate-900">
            72<span className="text-[2rem] sm:text-[2.25rem] font-semibold align-top">%</span>
          </span>
        </div>
      </div>
      <div className="space-y-4 max-w-md">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-sejong-blue">Insight</p>
        <p className="text-base sm:text-lg font-medium leading-relaxed text-slate-700">{INSIGHTS.innovation}</p>
      </div>
    </div>
  );
}

function UsagePanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-end lg:items-center">
      <div className="space-y-8 w-full max-w-lg mx-auto lg:mx-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[4rem] sm:text-[4.5rem] font-semibold tabular-nums leading-none tracking-tight text-slate-900">
            3.8
          </span>
          <span className="text-2xl font-medium tabular-nums text-slate-500">/ 5</span>
        </div>
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-sejong-blue">Self-assessed 활용 수준</p>
        <div className="flex gap-2 sm:gap-3 h-36 sm:h-40 items-stretch" aria-hidden>
          {USAGE_SEGMENTS.map((ratio, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end min-w-0 bg-slate-100 rounded-sm overflow-hidden">
              <div
                className="w-full transition-all duration-500 ease-out rounded-sm"
                style={{
                  height: `${ratio * 100}%`,
                  backgroundColor: ratio > 0 ? "rgb(var(--briefing-chart-gauge-rgb) / 1)" : "transparent",
                  minHeight: ratio > 0 ? 4 : 0,
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] sm:text-xs font-medium tabular-nums tracking-wide uppercase text-slate-500">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>
      <div className="space-y-4 max-w-md lg:pb-4">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-sejong-blue">Insight</p>
        <p className="text-base sm:text-lg font-medium leading-relaxed text-slate-700">{INSIGHTS.usage}</p>
      </div>
    </div>
  );
}

function EducationPanel() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-sejong-blue mb-2">교육·재교육 참여 의향</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[4rem] sm:text-[4.5rem] font-semibold tabular-nums leading-none tracking-tight text-slate-900">
              68<span className="text-[2.25rem] sm:text-[2.75rem] font-semibold align-top">%</span>
            </span>
            <span className="text-sm font-medium pb-2 text-slate-700">긍정 응답</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex h-16 sm:h-[4.5rem] w-full overflow-hidden rounded-sm">
          {STACK_PARTS.map((p) => (
            <div
              key={p.key}
              className="h-full min-w-0 transition-all duration-500"
              style={{ width: `${p.pct}%`, backgroundColor: p.fill }}
              title={`${p.key} ${p.pct}%`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-6 text-xs sm:text-sm font-medium text-slate-700">
          {STACK_PARTS.map((p) => (
            <span key={p.key} className="inline-flex items-center gap-2 tabular-nums">
              <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: p.fill }} />
              {p.key} {p.pct}%
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-3xl pt-2">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-sejong-blue mb-3">Insight</p>
        <p className="text-base sm:text-lg font-medium leading-relaxed text-slate-700">{INSIGHTS.education}</p>
      </div>
    </div>
  );
}
