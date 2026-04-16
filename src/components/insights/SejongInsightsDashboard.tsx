"use client";

/**
 * 시각화: Recharts (npm install recharts)
 * 더미 데이터: public/mockData.json (/mockData.json 으로 fetch)
 */

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FilteredInsightCards } from "./FilteredInsightCards";

export type SejongMockData = {
  summary: {
    totalResponses: number;
    newPanelsThisWeek: number;
    activePanelsThisMonth: number;
    avgWeeklyResponseRate: number;
  };
  dongParticipation: { dong: string; responses: number; panels: number }[];
  interestKeywords: { keyword: string; count: number }[];
  updatedAt: string;
};

const chartColors = {
  primary: "#004B8D",
  accent: "#6366f1",
  gradientEnd: "#0ea5e9",
};

function formatNumber(n: number) {
  return n.toLocaleString("ko-KR");
}

function HeatmapGrid({
  data,
}: {
  data: SejongMockData["dongParticipation"];
}) {
  const max = Math.max(...data.map((d) => d.responses), 1);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
      {data.map((row) => {
        const intensity = row.responses / max;
        const alpha = 0.25 + intensity * 0.75;
        return (
          <div
            key={row.dong}
            className="rounded-xl border border-primary-200/60 dark:border-primary-700/40 p-3 text-center transition-transform hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, rgba(99, 102, 241, ${alpha * 0.35}) 0%, rgba(0, 75, 141, ${alpha * 0.55}) 100%)`,
            }}
          >
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{row.dong}</p>
            <p className="mt-1 text-lg font-bold text-primary-700 dark:text-sky-300">
              {formatNumber(row.responses)}
            </p>
            <p className="text-[10px] text-slate-600 dark:text-slate-400">응답</p>
          </div>
        );
      })}
    </div>
  );
}

export function SejongInsightsDashboard() {
  const [data, setData] = useState<SejongMockData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/mockData.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: SejongMockData) => {
        if (!cancelled) setData(json);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "load failed");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const barData = useMemo(() => {
    if (!data) return [];
    return [...data.dongParticipation]
      .sort((a, b) => b.responses - a.responses)
      .map((d) => ({ name: d.dong, 응답: d.responses, 패널: d.panels }));
  }, [data]);

  const keywordChartData = useMemo(() => {
    if (!data) return [];
    return [...data.interestKeywords]
      .sort((a, b) => b.count - a.count)
      .map((k) => ({ name: k.keyword, 건수: k.count }));
  }, [data]);

  const barColors = useMemo(() => {
    const n = barData.length;
    return barData.map((_, i) => {
      const t = n > 1 ? i / (n - 1) : 0;
      return t < 0.5 ? chartColors.accent : chartColors.primary;
    });
  }, [barData]);

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <p className="text-red-600 dark:text-red-400 text-sm">
          mockData.json 을 불러오지 못했습니다: {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 px-4">
        <div className="h-10 w-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-500">대시보드 데이터를 불러오는 중…</p>
      </div>
    );
  }

  const { summary, dongParticipation } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="border-b border-primary-100/80 dark:border-primary-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-sm font-medium text-violet-600 dark:text-violet-400 tracking-wide">
            Sejong Lab · Local Insight
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-600 via-primary-600 to-sky-600 bg-clip-text text-transparent">
            세종 로컬 인사이트 대시보드
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm max-w-2xl">
            세종시 패널·응답 데이터를 한눈에 확인합니다. (데모용{" "}
            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">public/mockData.json</code>)
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-primary-100 dark:border-primary-900/60 bg-white dark:bg-slate-800/80 p-5 shadow-sm shadow-primary-500/5">
            <p className="text-xs font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
              총 응답 수
            </p>
            <p className="mt-2 text-3xl font-bold text-primary-700 dark:text-sky-300 tabular-nums">
              {formatNumber(summary.totalResponses)}
            </p>
            <p className="mt-1 text-xs text-slate-500">누적 설문·의견 응답</p>
          </div>
          <div className="rounded-2xl border border-sky-100 dark:border-sky-900/50 bg-white dark:bg-slate-800/80 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-sky-600 dark:text-sky-400">
              금주 신규 패널
            </p>
            <p className="mt-2 text-3xl font-bold text-sky-700 dark:text-sky-300 tabular-nums">
              {formatNumber(summary.newPanelsThisWeek)}
            </p>
            <p className="mt-1 text-xs text-slate-500">이번 주 가입·동의 완료</p>
          </div>
          <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-slate-800/80 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              이번 달 활동 패널
            </p>
            <p className="mt-2 text-3xl font-bold text-indigo-800 dark:text-indigo-300 tabular-nums">
              {formatNumber(summary.activePanelsThisMonth)}
            </p>
            <p className="mt-1 text-xs text-slate-500">최근 30일 참여 이력</p>
          </div>
          <div className="rounded-2xl border border-violet-100 dark:border-violet-900/50 bg-white dark:bg-slate-800/80 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
              주간 응답률
            </p>
            <p className="mt-2 text-3xl font-bold text-violet-800 dark:text-violet-300 tabular-nums">
              {summary.avgWeeklyResponseRate}%
            </p>
            <p className="mt-1 text-xs text-slate-500">발송 대비 응답 비율(가상)</p>
          </div>
        </div>

        <FilteredInsightCards
          dongParticipation={dongParticipation}
          interestKeywords={data.interestKeywords}
        />

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-primary-100 dark:border-primary-900/50 bg-white dark:bg-slate-800/60 p-5 sm:p-6 shadow-lg shadow-primary-900/5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-violet-500 to-primary-600" />
              세종시 동별 참여 분포
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
              응답 수 기준 히트맵 스타일 그리드 + 상세 막대 그래프
            </p>
            <HeatmapGrid data={dongParticipation} />
            <div className="mt-8 h-[320px] w-full min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis type="number" tick={{ fontSize: 11 }} className="text-slate-600" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={72}
                    tick={{ fontSize: 11 }}
                    className="text-slate-700 dark:text-slate-300"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid rgb(226 232 240)",
                    }}
                    formatter={(value) => [formatNumber(value == null ? 0 : Number(value)), ""]}
                  />
                  <Bar dataKey="응답" name="응답 수" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={barColors[i] ?? chartColors.primary} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-2xl border border-violet-100 dark:border-violet-900/40 bg-white dark:bg-slate-800/60 p-5 sm:p-6 shadow-lg shadow-violet-900/5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-primary-600 to-sky-500" />
              주요 관심 키워드
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
              패널 온보딩·관심사 기준 상위 키워드 (막대 차트)
            </p>
            <div className="h-[420px] w-full min-h-[360px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={keywordChartData} margin={{ top: 8, right: 12, left: 4, bottom: 64 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis
                    dataKey="name"
                    angle={-32}
                    textAnchor="end"
                    height={72}
                    interval={0}
                    tick={{ fontSize: 10 }}
                    className="text-slate-600 dark:text-slate-400"
                  />
                  <YAxis tick={{ fontSize: 11 }} className="text-slate-600" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid rgb(226 232 240)",
                    }}
                    formatter={(value) => [formatNumber(value == null ? 0 : Number(value)), "건"]}
                  />
                  <Bar dataKey="건수" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {keywordChartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          i % 3 === 0
                            ? chartColors.primary
                            : i % 3 === 1
                              ? chartColors.accent
                              : chartColors.gradientEnd
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <p className="text-center text-xs text-slate-400 pb-8">
          데이터 출처: public/mockData.json · 실제 서비스 연동 시 API로 교체하세요.
        </p>
      </div>
    </div>
  );
}
