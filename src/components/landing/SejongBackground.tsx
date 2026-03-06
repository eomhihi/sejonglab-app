export function SejongBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 원래 그라디언트 배경 복원 */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-50/30 to-mint-50/20" />
      
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
            <stop offset="0%" stopColor="#004B8D" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <linearGradient id="curve-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#004B8D" />
          </linearGradient>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor="#004B8D" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      </svg>

      {/* 상단 그라디언트 오버레이 */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-sky-50/50 via-transparent to-transparent" />
      
      {/* 하단 민트 그라디언트 */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-mint-50/30 via-transparent to-transparent" />
    </div>
  );
}

export function EungBridgeGraphic() {
  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto">
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* 이응다리 원형 구조 - 원래대로 복원 */}
        <circle
          cx="150"
          cy="150"
          r="120"
          stroke="url(#bridge-gradient)"
          strokeWidth="8"
          fill="none"
          opacity="0.9"
        />
        <circle
          cx="150"
          cy="150"
          r="100"
          stroke="url(#bridge-gradient-inner)"
          strokeWidth="3"
          fill="none"
          opacity="0.5"
        />
        <circle
          cx="150"
          cy="150"
          r="80"
          stroke="#004B8D"
          strokeWidth="1"
          fill="none"
          opacity="0.2"
          strokeDasharray="8 4"
        />

        {/* 내부 - 밝은 배경으로 텍스트 가독성 확보 */}
        <circle cx="150" cy="150" r="60" fill="white" opacity="0.95" />
        <circle cx="150" cy="150" r="60" fill="url(#inner-gradient)" opacity="0.05" />

        <defs>
          <linearGradient id="bridge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#004B8D" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <linearGradient id="bridge-gradient-inner" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#004B8D" />
          </linearGradient>
          <radialGradient id="inner-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#004B8D" />
          </radialGradient>
        </defs>
      </svg>

      {/* 중앙 텍스트 - 짙은 네이비로 가독성 극대화 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 drop-shadow-sm">
        <span className="text-xs sm:text-sm font-bold tracking-wider mb-1 text-[#004B8D]">
          AI & Data Driven
        </span>
        <span className="text-lg sm:text-xl font-extrabold text-[#002D56]">
          Policy
        </span>
      </div>
    </div>
  );
}
