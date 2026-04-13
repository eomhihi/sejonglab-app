"use client";

/**
 * 세종시 행정동을 단순화한 스타일 SVG (실제 경계와 다를 수 있음).
 * 클로로플레스: 응답 가중치에 따라 fill 농도 변화 + CSS transition
 */

const DONG_ORDER = [
  "도담동",
  "아름동",
  "고운동",
  "한솔동",
  "보람동",
  "종촌동",
  "새롬동",
  "대평동",
  "소담동",
  "반곡동",
] as const;

/** viewBox 0 0 520 380 — 대략적 격자 배치 */
const REGION_GEOM: Record<
  string,
  { x: number; y: number; w: number; h: number; rot?: number }
> = {
  도담동: { x: 28, y: 52, w: 132, h: 86, rot: -2 },
  아름동: { x: 172, y: 44, w: 128, h: 92, rot: 1 },
  고운동: { x: 312, y: 48, w: 124, h: 88, rot: -1 },
  한솔동: { x: 36, y: 152, w: 124, h: 84, rot: 2 },
  보람동: { x: 172, y: 148, w: 130, h: 88, rot: -1 },
  종촌동: { x: 314, y: 150, w: 122, h: 86, rot: 1 },
  새롬동: { x: 20, y: 252, w: 118, h: 82, rot: -1 },
  대평동: { x: 150, y: 248, w: 120, h: 86, rot: 2 },
  소담동: { x: 282, y: 250, w: 118, h: 84, rot: -2 },
  반곡동: { x: 408, y: 248, w: 100, h: 88, rot: 0 },
};

function fillForIntensity(t: number): string {
  // t: 0..1 → 연한 라벤더 ~ 세종 블루
  const r = Math.round(224 + (0 - 224) * t);
  const g = Math.round(231 + (75 - 231) * t);
  const b = Math.round(255 + (141 - 255) * t);
  return `rgb(${r},${g},${b})`;
}

type Props = {
  valuesByDong: Record<string, number>;
  className?: string;
};

export function SejongChoroplethMap({ valuesByDong, className = "" }: Props) {
  const max = Math.max(
    1,
    ...DONG_ORDER.map((d) => valuesByDong[d] ?? 0)
  );

  return (
    <div className={className}>
      <svg
        viewBox="0 0 520 380"
        className="w-full h-auto max-h-[340px] drop-shadow-sm"
        role="img"
        aria-label="세종시 동별 응답 분포 클로로플레스 지도"
      >
        <defs>
          <linearGradient id="mapBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e0e7ff" />
          </linearGradient>
        </defs>
        <rect width="520" height="380" rx="16" fill="url(#mapBg)" />
        <text x="260" y="28" textAnchor="middle" fill="#475569" fontSize="13" fontWeight="600">
          세종시 · 동별 응답 강도 (데모)
        </text>
        {DONG_ORDER.map((dong) => {
          const g = REGION_GEOM[dong];
          if (!g) return null;
          const v = valuesByDong[dong] ?? 0;
          const t = v / max;
          const fill = fillForIntensity(t);
          return (
            <g key={dong} transform={g.rot ? `rotate(${g.rot}, ${g.x + g.w / 2}, ${g.y + g.h / 2})` : undefined}>
              <rect
                x={g.x}
                y={g.y}
                width={g.w}
                height={g.h}
                rx={10}
                fill={fill}
                stroke="rgba(0,75,141,0.35)"
                strokeWidth={1.5}
                className="[transition:fill_0.55s_ease,stroke_0.55s_ease,opacity_0.55s_ease]"
                style={{ opacity: 0.35 + t * 0.65 }}
              />
              <text
                x={g.x + g.w / 2}
                y={g.y + g.h / 2 - 4}
                textAnchor="middle"
                fill="#1e293b"
                fontSize="11"
                fontWeight="700"
                pointerEvents="none"
                style={{ textShadow: "0 0 4px #fff" }}
              >
                {dong.replace("동", "")}
              </text>
              <text
                x={g.x + g.w / 2}
                y={g.y + g.h / 2 + 12}
                textAnchor="middle"
                fill="#334155"
                fontSize="10"
                fontWeight="500"
                pointerEvents="none"
                style={{ textShadow: "0 0 4px #fff" }}
              >
                {Math.round(v).toLocaleString("ko-KR")}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="w-4 h-2 rounded bg-[rgb(224,231,255)] border border-primary-200" /> 적음
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-4 h-2 rounded bg-[rgb(0,75,141)] border border-primary-400" /> 많음
        </span>
      </div>
    </div>
  );
}
