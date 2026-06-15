"use client";

import type { CSSProperties, ReactNode } from "react";
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

export type AdminDashboardData = {
  total: number;
  onboardingCompleted: number;
  daily: { date: string; count: number }[];
  gender: { label: string; value: number }[];
  ageGroup: { label: string; value: number }[];
  region: { label: string; value: number }[];
  occupation: { label: string; value: number }[];
  signupPath: { label: string; value: number }[];
  provider: { label: string; value: number }[];
};

const COLORS = [
  "#38bdf8", "#34d399", "#a78bfa", "#fbbf24", "#f472b6", "#22d3ee", "#fb7185", "#a3e635",
  "#60a5fa", "#2dd4bf", "#c084fc", "#f59e0b", "#e879f9", "#4ade80", "#fca5a5", "#facc15",
  "#818cf8", "#5eead4", "#d8b4fe", "#fdba74", "#f9a8d4", "#86efac", "#67e8f9", "#bef264",
];

const AXIS_TICK = { fontSize: 11, fill: "#94a3b8" } as const;

const TOOLTIP_CONTENT_STYLE: CSSProperties = {
  borderRadius: 12,
  border: "1px solid #334155",
  backgroundColor: "#0f172a",
  color: "#e2e8f0",
  fontSize: 12,
  fontVariantNumeric: "tabular-nums",
};

const TOOLTIP_CURSOR = { fill: "rgba(56, 189, 248, 0.08)" } as const;

type TooltipEntry = {
  value?: number | string;
  name?: string | number;
  payload?: Record<string, unknown>;
};

/**
 * 모든 차트(도넛·세로막대·가로막대) 공통 툴팁.
 * - 동일한 서체(Pretendard 상속)·흰색 글자·"분류 : N명" 형식으로 통일
 * - dataKey 이름(value/count/인원 등)은 노출하지 않음
 */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const title =
    label !== undefined && label !== ""
      ? label
      : item.name ?? (item.payload?.label as string | undefined) ?? "";
  const numeric = typeof item.value === "number" ? item.value : Number(item.value ?? 0);

  return (
    <div style={TOOLTIP_CONTENT_STYLE} className="px-3 py-2">
      <p style={{ margin: 0, color: "#ffffff", fontVariantNumeric: "tabular-nums" }}>
        {title ? `${title} : ` : ""}
        {numeric.toLocaleString()}명
      </p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  legend,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  legend?: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-5 shadow-lg flex flex-col">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {subtitle ? <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p> : null}
      </div>
      {/* 차트 영역은 고정 높이, 범례는 그 아래 일반 흐름으로 배치해 잘리지 않도록 함 */}
      <div className="h-[240px] w-full min-w-0 shrink-0">{children}</div>
      {legend ? <div className="mt-3">{legend}</div> : null}
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="flex h-full items-center justify-center text-xs text-slate-500">
      표시할 데이터가 없습니다.
    </div>
  );
}

/** 세로 막대 차트 (일자별 등) */
function VerticalBar({ data, dataKey = "value", xKey = "label" }: { data: Record<string, unknown>[]; dataKey?: string; xKey?: string }) {
  if (!data.length) return <EmptyHint />;
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.5} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} width={36} />
        <Tooltip content={<ChartTooltip />} cursor={TOOLTIP_CURSOR} />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} fill={COLORS[0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** 가로 막대 차트 (분류별 분포, top N) */
function HorizontalBar({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length) return <EmptyHint />;
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <BarChart layout="vertical" data={data} margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={96}
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={TOOLTIP_CURSOR} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** 도넛 차트 (비율) */
function Donut({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length) return <EmptyHint />;
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={2}
          stroke="#0f172a"
          strokeWidth={2}
          startAngle={90}
          endAngle={-270}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function Legend({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
      {data.map((d, i) => (
        <li key={d.label} className="flex items-center gap-1.5 text-xs text-slate-300">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
            aria-hidden
          />
          <span>{d.label}</span>
          <span className="tabular-nums text-slate-400">{d.value}명</span>
        </li>
      ))}
    </ul>
  );
}

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  const completionRate =
    data.total > 0 ? Math.round((data.onboardingCompleted / data.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <ChartCard title="일자별 신규 가입" subtitle="최근 14일">
        <VerticalBar data={data.daily} dataKey="count" xKey="date" />
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <ChartCard
          title="성별 분포"
          subtitle={`온보딩 완료율 ${completionRate}%`}
          legend={<Legend data={data.gender} />}
        >
          <Donut data={data.gender} />
        </ChartCard>

        <ChartCard title="연령대 분포">
          <VerticalBar data={data.ageGroup} />
        </ChartCard>

        <ChartCard title="가입 경로 (유입)" legend={<Legend data={data.signupPath} />}>
          <Donut data={data.signupPath} />
        </ChartCard>

        <ChartCard title="가입 수단 (소셜)" legend={<Legend data={data.provider} />}>
          <Donut data={data.provider} />
        </ChartCard>

        <ChartCard title="거주지역 분포" subtitle="상위 10개">
          <HorizontalBar data={data.region} />
        </ChartCard>

        <ChartCard title="직업 분포" subtitle="상위 10개">
          <HorizontalBar data={data.occupation} />
        </ChartCard>
      </div>
    </div>
  );
}
