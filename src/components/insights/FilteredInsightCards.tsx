"use client";

/**
 * 필터 인사이트 + 클로로플레스 + XLSX 다운로드
 * npm install xlsx (클라이언트에서 writeFile)
 */

import { useCallback, useMemo, useState } from "react";
import * as XLSX from "xlsx";
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
import { SejongChoroplethMap } from "./SejongChoroplethMap";

const CHART_ANIMATION_MS = 580;

export type InsightRow = {
  gender: string;
  ageGroup: string;
  dong: string;
  weight: number;
  interest: string;
};

type DongRow = { dong: string; responses: number; panels: number };
type KwRow = { keyword: string; count: number };

function buildSyntheticRows(dongs: DongRow[], keywords: KwRow[]): InsightRow[] {
  const genders = ["남성", "여성"];
  const ages = ["20대", "30대", "40대", "50대 이상"];
  const kws = keywords.length > 0 ? keywords.map((k) => k.keyword) : ["기타"];
  const rows: InsightRow[] = [];
  let idx = 0;
  for (const d of dongs) {
    const n = Math.min(64, Math.max(6, Math.round(d.responses / 95)));
    const base = d.responses / n;
    for (let i = 0; i < n; i++) {
      const wobble = 0.85 + 0.3 * Math.sin((idx + i) * 0.7);
      rows.push({
        gender: genders[idx % 2],
        ageGroup: ages[(idx + i) % ages.length],
        dong: d.dong,
        weight: Math.round(base * wobble * 10) / 10,
        interest: kws[(idx + i) % kws.length],
      });
      idx++;
    }
  }
  return rows;
}

function formatNumber(n: number) {
  return n.toLocaleString("ko-KR");
}

const chartColors = {
  primary: "#124559",
  accent: "#6366f1",
  sky: "#0ea5e9",
};

type Props = {
  dongParticipation: DongRow[];
  interestKeywords: KwRow[];
};

export function FilteredInsightCards({ dongParticipation, interestKeywords }: Props) {
  const allRows = useMemo(
    () => buildSyntheticRows(dongParticipation, interestKeywords),
    [dongParticipation, interestKeywords]
  );

  const [gender, setGender] = useState<string>("전체");
  const [ageGroup, setAgeGroup] = useState<string>("전체");
  const [region, setRegion] = useState<string>("전체");

  const regionOptions = useMemo(() => {
    const set = new Set(dongParticipation.map((d) => d.dong));
    return ["전체", ...Array.from(set)];
  }, [dongParticipation]);

  const filteredRows = useMemo(() => {
    return allRows.filter((r) => {
      if (gender !== "전체" && r.gender !== gender) return false;
      if (ageGroup !== "전체" && r.ageGroup !== ageGroup) return false;
      if (region !== "전체" && r.dong !== region) return false;
      return true;
    });
  }, [allRows, gender, ageGroup, region]);

  const valuesByDong = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const d of dongParticipation) acc[d.dong] = 0;
    for (const r of filteredRows) {
      acc[r.dong] = (acc[r.dong] ?? 0) + r.weight;
    }
    return acc;
  }, [filteredRows, dongParticipation]);

  const barByDong = useMemo(() => {
    return Object.entries(valuesByDong)
      .map(([name, 응답]) => ({ name, 응답: Math.round(응답) }))
      .sort((a, b) => b.응답 - a.응답);
  }, [valuesByDong]);

  const keywordAgg = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of filteredRows) {
      m.set(r.interest, (m.get(r.interest) ?? 0) + r.weight);
    }
    return Array.from(m.entries())
      .map(([name, 건수]) => ({ name, 건수: Math.round(건수 * 10) / 10 }))
      .sort((a, b) => b.건수 - a.건수)
      .slice(0, 10);
  }, [filteredRows]);

  const totalWeight = useMemo(
    () => filteredRows.reduce((s, r) => s + r.weight, 0),
    [filteredRows]
  );

  const topDong = useMemo(() => {
    let best = "";
    let v = -1;
    for (const [d, val] of Object.entries(valuesByDong)) {
      if (val > v) {
        v = val;
        best = d;
      }
    }
    return { dong: best || "-", value: Math.round(v) };
  }, [valuesByDong]);

  const topKeyword = keywordAgg[0] ?? { name: "-", 건수: 0 };

  const handleDownloadXlsx = useCallback(() => {
    const detail = filteredRows.map((r) => ({
      성별: r.gender,
      연령대: r.ageGroup,
      거주지: r.dong,
      응답가중치: r.weight,
      관심키워드: r.interest,
    }));
    const aggDong = barByDong.map((r) => ({ 동: r.name, 필터응답합계: r.응답 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detail), "필터_상세");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(aggDong), "동별_집계");
    XLSX.writeFile(wb, "세종랩_인사이트_필터결과.xlsx");
  }, [filteredRows, barByDong]);

  const barColorsDong = barByDong.map((_, i) =>
    i % 3 === 0 ? chartColors.primary : i % 3 === 1 ? chartColors.accent : chartColors.sky
  );

  const barColorsKw = keywordAgg.map((_, i) =>
    i % 3 === 0 ? chartColors.accent : i % 3 === 1 ? chartColors.primary : chartColors.sky
  );

  return (
    <section className="rounded-2xl border border-violet-200/80 dark:border-violet-900/40 bg-gradient-to-br from-white via-violet-50/30 to-sky-50/40 dark:from-slate-800/90 dark:via-slate-800/70 dark:to-slate-900/80 p-5 sm:p-6 shadow-xl shadow-violet-900/5">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-primary-600" />
            필터링 기반 인사이트
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            성별·연령·거주지로 세그먼트하면 차트와 지도가 함께 갱신됩니다.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            성별
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="rounded-lg border border-primary-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 min-w-[120px]"
            >
              <option value="전체">전체</option>
              <option value="남성">남성</option>
              <option value="여성">여성</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            연령대
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="rounded-lg border border-primary-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 min-w-[120px]"
            >
              <option value="전체">전체</option>
              <option value="20대">20대</option>
              <option value="30대">30대</option>
              <option value="40대">40대</option>
              <option value="50대 이상">50대 이상</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            거주지
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-lg border border-primary-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 min-w-[120px]"
            >
              {regionOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <div className="rounded-xl border border-primary-100 dark:border-primary-900/50 bg-white/90 dark:bg-slate-800/80 p-4">
          <p className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
            필터 응답 합계
          </p>
          <p className="mt-1 text-2xl font-bold text-primary-700 dark:text-sky-300 tabular-nums transition-all duration-500">
            {formatNumber(Math.round(totalWeight))}
          </p>
        </div>
        <div className="rounded-xl border border-sky-100 dark:border-sky-900/50 bg-white/90 dark:bg-slate-800/80 p-4">
          <p className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wide">
            표본 행 수
          </p>
          <p className="mt-1 text-2xl font-bold text-sky-700 dark:text-sky-300 tabular-nums transition-all duration-500">
            {formatNumber(filteredRows.length)}
          </p>
        </div>
        <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-white/90 dark:bg-slate-800/80 p-4">
          <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
            최다 응답 동
          </p>
          <p className="mt-1 text-lg font-bold text-indigo-900 dark:text-indigo-200 transition-all duration-500">
            {topDong.dong}
          </p>
          <p className="text-xs text-slate-500">{formatNumber(topDong.value)} 가중합</p>
        </div>
        <div className="rounded-xl border border-fuchsia-100 dark:border-fuchsia-900/40 bg-white/90 dark:bg-slate-800/80 p-4">
          <p className="text-[11px] font-semibold text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-wide">
            1위 관심 키워드
          </p>
          <p className="mt-1 text-lg font-bold text-fuchsia-900 dark:text-fuchsia-200 transition-all duration-500 truncate">
            {topKeyword.name}
          </p>
          <p className="text-xs text-slate-500">{topKeyword.건수} 가중합</p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              동별 응답 (막대)
            </h3>
            <button
              type="button"
              onClick={handleDownloadXlsx}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors"
            >
              📥 필터 결과 엑셀
            </button>
          </div>
          <div
            key={`bar-dong-${gender}-${ageGroup}-${region}`}
            className="h-[280px] w-full min-h-[240px]"
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={barByDong} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={68} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px" }}
                  formatter={(v) => [formatNumber(v == null ? 0 : Number(v)), "응답"]}
                />
                <Bar
                  dataKey="응답"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                  isAnimationActive
                  animationDuration={CHART_ANIMATION_MS}
                  animationEasing="ease-out"
                >
                  {barByDong.map((_, i) => (
                    <Cell key={i} fill={barColorsDong[i] ?? chartColors.primary} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3">
            세종시 클로로플레스 (SVG)
          </h3>
          <SejongChoroplethMap
            key={`map-${gender}-${ageGroup}-${region}`}
            valuesByDong={valuesByDong}
          />
        </div>
      </div>

      <div className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            필터 적용 관심 키워드
          </h3>
          <button
            type="button"
            onClick={handleDownloadXlsx}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors sm:hidden"
          >
            📥 엑셀 다운로드
          </button>
        </div>
        <div
          key={`bar-kw-${gender}-${ageGroup}-${region}`}
          className="h-[320px] w-full min-h-[280px]"
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              layout="vertical"
              data={keywordAgg}
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ borderRadius: "12px" }}
                formatter={(v) => [formatNumber(v == null ? 0 : Number(v)), "가중합"]}
              />
              <Bar
                dataKey="건수"
                radius={[0, 6, 6, 0]}
                maxBarSize={20}
                isAnimationActive
                animationDuration={CHART_ANIMATION_MS}
                animationEasing="ease-out"
              >
                {keywordAgg.map((_, i) => (
                  <Cell key={i} fill={barColorsKw[i] ?? chartColors.accent} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
