export function SejongBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 원래 그라디언트 배경 복원 */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-50/30 to-brand-light/25" />
      
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* 세종정부청사 유선형 곡선 패턴 - 원래대로 복원 */}
        <path
          d="M-100 400 Q 200 300, 400 350 T 800 300 T 1200 350 T 1600 300"
          stroke="url(#curve-gradient-1)"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />
        <path
          d="M-100 500 Q 300 400, 500 450 T 900 400 T 1300 450 T 1700 400"
          stroke="url(#curve-gradient-1)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.2"
        />
        <path
          d="M-100 600 Q 250 520, 450 560 T 850 520 T 1250 560 T 1650 520"
          stroke="url(#curve-gradient-2)"
          strokeWidth="1"
          fill="none"
          opacity="0.15"
        />
        
        {/* 금강 물결 패턴 - 원래대로 복원 */}
        <path
          d="M0 700 Q 180 680, 360 700 T 720 700 T 1080 700 T 1440 700"
          stroke="url(#wave-gradient)"
          strokeWidth="3"
          fill="none"
          opacity="0.1"
        />
        <path
          d="M0 750 Q 200 730, 400 750 T 800 750 T 1200 750 T 1600 750"
          stroke="url(#wave-gradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.08"
        />

        {/* 그라디언트 정의 - 원래 색상 복원 */}
        <defs>
          <linearGradient id="curve-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="var(--color-secondary)" />
          </linearGradient>
          <linearGradient id="curve-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-secondary)" />
            <stop offset="100%" stopColor="var(--color-primary)" />
          </linearGradient>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      </svg>

      {/* 상단 그라디언트 오버레이 */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-sky-50/50 via-transparent to-transparent" />
      
      {/* 하단 민트 그라디언트 */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-brand-light/35 via-transparent to-transparent" />
    </div>
  );
}

export { EungBridgeGraphic } from "./EungBridgeGraphic";
