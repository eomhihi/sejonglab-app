"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";
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

/** tailwind `theme.extend.colors.sejong.blue` (#004B8D) — 차트 fill은 클래스 미지원 */
const SEJONG_BLUE = "#004B8D";
const MUTED = "#94a3b8";

const N = 696;

const EXPERIENCE_DATA = [
  { name: "경험 있음", value: 22.7, fill: SEJONG_BLUE },
  { name: "경험 없음", value: 77.3, fill: "#e2e8f0" },
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
  if (name !== "경험 없음") return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.2) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#003666"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[10px] sm:text-[11px] font-semibold"
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
        <header className="mb-10 sm:mb-12 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-mint-100 rounded-full mb-4">
            <BarChart3 className="w-4 h-4 text-[#004B8D]" />
            <span className="text-sm font-bold text-[#004B8D]">평생교육 인사이트</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#002D56] mb-4 drop-shadow-sm">
            평생교육 수요조사 인사이트
          </h2>
          <p className="mt-4 text-[13px] sm:text-base leading-relaxed text-[#1d3557] break-keep [word-break:keep-all]">
            세종 시민 <span className="font-semibold tabular-nums">{N}</span>명의 목소리는, 낮은 참여 경험(22.7%)에도
            불구하고
            <br />
            <span className="font-semibold">높은 참여 의지(57.9%)</span>와{" "}
            <span className="font-semibold">직업·디지털 역량</span> 중심의 실용적 학습 수요를 선명하게 보여줍니다.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Chart 1 — donut */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm flex flex-col min-h-[320px]">
            <h3 className="text-sm font-bold text-slate-800 mb-1">평생교육 참여 경험</h3>
            <p className="text-xs text-slate-500 mb-4 break-keep [word-break:keep-all]">과거 참여 여부 (비율)</p>
            <div className="flex-1 min-h-[220px]" style={{ fontFamily: "inherit" }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                    formatter={(v, name) => [`${String(name || "")}: ${Number(v)}%`, ""]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                      fontFamily: "inherit",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
              <li className="flex justify-between gap-2">
                <span>경험 있음</span>
                <span className="font-semibold tabular-nums text-slate-900">22.7%</span>
              </li>
              <li className="flex justify-between gap-2">
                <span>경험 없음</span>
                <span className="font-semibold tabular-nums text-slate-900">77.3%</span>
              </li>
            </ul>
          </div>

          {/* Chart 2 — horizontal bar */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm flex flex-col min-h-[320px]">
            <h3 className="text-sm font-bold text-slate-800 mb-1">관심 있는 학습 분야</h3>
            <p className="text-xs text-slate-500 mb-4 break-keep [word-break:keep-all]">상위 5개 (비율)</p>
            <div className="flex-1 min-h-[240px]" style={{ fontFamily: "inherit" }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart
                  layout="vertical"
                  data={[...INTEREST_DATA]}
                  margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    domain={[0, 40]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fontFamily: "inherit" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={118}
                    tick={{ fontSize: 11, fill: "#475569", fontFamily: "inherit" }}
                  />
                  <Tooltip
                    formatter={(v) => [`${Number(v)}%`, "비율"]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                      fontFamily: "inherit",
                    }}
                  />
                  <Bar dataKey="pct" radius={[0, 6, 6, 0]} barSize={18}>
                    {[...INTEREST_DATA].map((row, i) => (
                      <Cell key={i} fill={row.highlight ? SEJONG_BLUE : MUTED} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3 — intention summary */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm flex flex-col min-h-[320px]">
            <h3 className="text-sm font-bold text-slate-800 mb-1">평생교육 참여 의향</h3>
            <p className="text-xs text-slate-500 mb-5 break-keep [word-break:keep-all]">태도 분포 (비율)</p>

            <p className="text-base sm:text-lg font-bold text-primary-800 leading-snug mb-5 break-keep [word-break:keep-all] text-center">
              세종 시민 <span className="text-sejong-blue">10명 중 약 6명</span>은 평생학습 참여에 적극적인 태도
              견지
            </p>

            <div className="space-y-4 flex-1">
              {INTENTION_DATA.map((row) => (
                <div key={row.key}>
                  <div className="flex items-baseline justify-between gap-3 mb-1.5">
                    <span className="text-[11px] sm:text-[11px] text-slate-600">{row.label}</span>
                    <span className="text-[11px] sm:text-[11px] font-extrabold tabular-nums text-slate-900">
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
          <Link
            href="/signup"
            className="inline-flex items-center justify-center h-12 sm:h-14 px-8 rounded-xl bg-sejong-blue text-white text-sm sm:text-base font-bold shadow-md shadow-sejong-blue/25 hover:scale-[1.02] hover:bg-sejong-blue-dark transition"
          >
            패널 신청하기
          </Link>
        </footer>
      </div>
    </section>
  );
}
