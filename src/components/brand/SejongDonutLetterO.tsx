import type { CSSProperties } from "react";

type SejongDonutLetterOTone = "dark" | "light";

type SejongDonutLetterOProps = {
  tone?: SejongDonutLetterOTone;
  className?: string;
  style?: CSSProperties;
};

const CX = 50;
const CY = 50;
const R_OUTER = 44;
/** extrabold O와 맞추기 위해 외곽(R_OUTER) 유지, 중심 쪽으로 링 두께 확대 */
const R_INNER = 20;

/** 0° = 3시, 시계 방향(+) */
function polar(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function ringSectorPath(rOuter: number, rInner: number, startDeg: number, endDeg: number) {
  const start = polar(rOuter, startDeg);
  const end = polar(rOuter, endDeg);
  const innerEnd = polar(rInner, endDeg);
  const innerStart = polar(rInner, startDeg);
  const delta = ((endDeg - startDeg + 360) % 360) || 360;
  const largeArc = delta > 180 ? 1 : 0;

  return [
    `M ${start.x} ${start.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

export function SejongDonutLetterO({ tone = "dark", className = "", style }: SejongDonutLetterOProps) {
  const mainColor = tone === "light" ? "#FFFFFF" : "#01161e";
  const accentColor = "#598392";
  const separatorColor = tone === "light" ? "#01161e" : "#FFFFFF";

  const accentPath = ringSectorPath(R_OUTER, R_INNER, -90, 0);
  const mainPath = ringSectorPath(R_OUTER, R_INNER, 0, 270);

  const topInner = polar(R_INNER, -90);
  const topOuter = polar(R_OUTER, -90);
  const rightInner = polar(R_INNER, 0);
  const rightOuter = polar(R_OUTER, 0);

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      className={`block shrink-0 ${className}`.trim()}
      style={style}
    >
      <path d={mainPath} fill={mainColor} />
      <path d={accentPath} fill={accentColor} />
      <line
        x1={topInner.x}
        y1={topInner.y}
        x2={topOuter.x}
        y2={topOuter.y}
        stroke={separatorColor}
        strokeWidth={3.2}
        strokeLinecap="butt"
      />
      <line
        x1={rightInner.x}
        y1={rightInner.y}
        x2={rightOuter.x}
        y2={rightOuter.y}
        stroke={separatorColor}
        strokeWidth={3.2}
        strokeLinecap="butt"
      />
    </svg>
  );
}
