"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SEJONG_BLUE = "#0047AB";
const MUTED = "#94a3b8";

const N = 696;

const EXPERIENCE_DATA = [
  { name: "참여 경험 있음", value: 22.7, fill: SEJONG_BLUE },
  { name: "참여 경험 없음", value: 77.3, fill: "#e2e8f0" },
] as const;

const INTEREST_DATA = [
  { name: "직업능력 향상", pct: 33.3, highlight: true },
  { name: "문화·예술·체육", pct: 16.4, highlight: false },
  { name: "인문·교양", pct: 12.9, highlight: false },
  { name: "디지털·AI·코딩", pct: 11.1, highlight: true },
  { name: "건강·웰빙", pct: 7.6, highlight: false },
] as const;

const INTENTION_DATA = [
  { key: "positive", label: "긍정 (매우 + 어느 정도)", pct: 57.9 },
  { key: "neutral", label: "보통", pct: 22.6 },
  { key: "negative", label: "부정 (별로 + 전혀)", pct: 19.6 },
] as const;

function montserratStyle(): CSSProperties {
  return { fontFamily: "var(--font-montserrat)" };
}

function ExperienceLabel(props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  name?: string;
}) {
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0, name } = props;
  if (name !== "참여 경험 없음") return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.2) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#0f172a"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[10px] sm:text-[11px] font-semibold"
      style={montserratStyle()}
    >
      <tspan x={x} dy="-0.6em">
        새로운 시작을 기다리는
      </tspan>
      <tspan x={x} dy="1.2em">
        세종 시민
      </tspan>
    </text>
  );
}

export function LifelongEducationInsightsSection() {
  return (
    <section className="bg-slate-50/80 border-y border-slate-200/70 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <header className="mb-8 sm:mb-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0047AB] mb-2">
            Panel insight
          </p>
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] leading-tight"
            style={montserratStyle()}
          >
            평생교육 수요조사 인사이트
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            세종 시민 <span className="font-semibold text-slate-800">N = {N}</span>명 응답을 바탕으로 한 핵심
            요약입니다.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Chart 1 — donut */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm flex flex-col min-h-[320px]">
            <h3 className="text-sm font-bold text-slate-800 mb-1">평생교육 참여 경험</h3>
            <p className="text-xs text-slate-500 mb-4">과거 참여 여부 (비율)</p>
            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[...EXPERIENCE_DATA]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="58%"
                    outerRadius="82%"
                    paddingAngle={2}
                    labelLine={false}
                    label={ExperienceLabel}
                  >
                    {[...EXPERIENCE_DATA].map((entry, i) => (
                      <Cell key={i} fill={entry.fill} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`${Number(v)}%`, "비율"]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
              <li className="flex justify-between gap-2">
                <span>경험 있음</span>
                <span className="font-semibold tabular-nums text-slate-900" style={montserratStyle()}>
                  22.7%
                </span>
              </li>
              <li className="flex justify-between gap-2">
                <span>경험 없음</span>
                <span className="font-semibold tabular-nums text-slate-900" style={montserratStyle()}>
                  77.3%
                </span>
              </li>
            </ul>
          </div>

          {/* Chart 2 — horizontal bar */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm flex flex-col min-h-[320px]">
            <h3 className="text-sm font-bold text-slate-800 mb-1">관심 있는 학습 분야</h3>
            <p className="text-xs text-slate-500 mb-4">상위 5개 (비율)</p>
            <div className="flex-1 min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[...INTEREST_DATA]}
                  margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 40]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={118}
                    tick={{ fontSize: 11, fill: "#475569" }}
                  />
                  <Tooltip
                    formatter={(v) => [`${Number(v)}%`, "비율"]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                  <Bar dataKey="pct" radius={[0, 6, 6, 0]} barSize={18}>
                    {[...INTEREST_DATA].map((row, i) => (
                      <Cell key={i} fill={row.highlight ? SEJONG_BLUE : MUTED} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
              <span className="font-semibold text-[#0047AB]">직업능력 향상</span>과{" "}
              <span className="font-semibold text-[#0047AB]">디지털·AI·코딩</span>은 세종블루로 강조했습니다.
            </p>
          </div>

          {/* Chart 3 — intention summary */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm flex flex-col min-h-[320px]">
            <h3 className="text-sm font-bold text-slate-800 mb-1">평생교육 참여 의향</h3>
            <p className="text-xs text-slate-500 mb-5">태도 분포 (비율)</p>

            <p className="text-lg sm:text-xl font-bold text-[#0f172a] leading-snug mb-6">
              세종 시민{" "}
              <span className="text-[#0047AB] text-2xl sm:text-3xl align-middle" style={montserratStyle()}>
                10명 중 약 6명
              </span>
              <span className="text-slate-700 font-semibold"> (57.9%)</span>은 배움에 대한{" "}
              <span className="text-[#0047AB]">강력한 의지</span>가 있습니다.
            </p>

            <div className="space-y-4 flex-1">
              {INTENTION_DATA.map((row) => (
                <div key={row.key}>
                  <div className="flex items-baseline justify-between gap-3 mb-1.5">
                    <span className="text-xs sm:text-sm text-slate-600">{row.label}</span>
                    <span
                      className="text-base sm:text-lg font-extrabold tabular-nums text-slate-900"
                      style={montserratStyle()}
                    >
                      {row.pct}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${row.pct}%`,
                        backgroundColor: row.key === "positive" ? SEJONG_BLUE : "#cbd5e1",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="mt-10 sm:mt-12 rounded-2xl border border-slate-200/80 bg-white px-5 py-6 sm:px-8 sm:py-8 text-center shadow-sm">
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            이 데이터는 세종랩 패널 여러분의 소중한 의견으로 만들어졌습니다. 지금 패널로 가입하여 세종의 미래를 직접
            설계하세요.
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-flex items-center justify-center h-12 sm:h-14 px-8 rounded-xl bg-[#0047AB] text-white text-sm sm:text-base font-bold shadow-md shadow-[#0047AB]/20 hover:scale-[1.02] hover:brightness-110 transition"
            style={montserratStyle()}
          >
            패널 신청하기
          </Link>
        </footer>
      </div>
    </section>
  );
}
