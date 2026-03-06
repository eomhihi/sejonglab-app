export const GENDER_OPTIONS = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
] as const;

export const AGE_GROUP_OPTIONS = [
  { value: "10s", label: "10대" },
  { value: "20s", label: "20대" },
  { value: "30s", label: "30대" },
  { value: "40s", label: "40대" },
  { value: "50s", label: "50대" },
  { value: "60s+", label: "60대 이상" },
] as const;

export const REGION_OPTIONS = [
  "조치원읍", "연기면", "연동면", "부강면", "금남면", "장군면", "연서면", "전의면", "전동면", "소정면",
  "한솔동", "나성동", "다정동", "어진동", "종촌동", "고운동", "보람동", "대평동", "새롬동", "도담동",
  "아름동", "소담동", "반곡동", "가람동", "합강동", "해밀동", "한별동", "가온동", "산울동", "온빛동", "장지동",
] as const;

export const INTEREST_CATEGORIES = [
  {
    category: "보육 및 교육",
    icon: "📚",
    topics: ["어린이집/학교 시설", "방과 후 프로그램", "평생교육"],
  },
  {
    category: "교통 및 이동",
    icon: "🚌",
    topics: ["시내버스 노선", "주차 문제", "자전거 도로(어울링)", "공유 킥보드"],
  },
  {
    category: "문화 및 여가",
    icon: "🎭",
    topics: ["지역 축제", "도서관 서비스", "공원 및 녹지 조성", "체육 시설"],
  },
  {
    category: "환경 및 안전",
    icon: "🌿",
    topics: ["쓰레기 배출/재활용", "미세먼지 대응", "방범 CCTV", "가로등"],
  },
  {
    category: "지역 경제",
    icon: "💰",
    topics: ["지역화폐(여민전)", "전통시장 활성화", "청년 창업 지원"],
  },
  {
    category: "복지 및 건강",
    icon: "❤️",
    topics: ["노인 복지", "장애인 지원", "보건소 서비스", "마음건강 상담"],
  },
  {
    category: "도시 개발",
    icon: "🏗️",
    topics: ["신도시 건설", "상가 공실 문제", "스마트시티 서비스"],
  },
  {
    category: "미래 신사업",
    icon: "🚀",
    topics: ["자율주행 셔틀", "드론 배송 서비스", "AI 기반 스마트 홈", "로봇 순찰"],
  },
  {
    category: "시민 참여 및 정책",
    icon: "🗳️",
    topics: ["예산 편성 참여", "시민 위원회 활동", "정책 아이디어 제안", "동네 문제 토론"],
  },
] as const;
