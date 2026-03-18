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

/**
 * 관심 분야: 섹션 제목(비선택) + 키워드(다중 선택).
 * User.interests 에 선택된 키워드 문자열 배열로 저장.
 */
export const ONBOARDING_INTEREST_SECTIONS = [
  {
    id: "city_transport",
    title: "도시/교통",
    keywords: ["BRT 노선", "주차난", "도로 정비", "대중교통 만족도"],
  },
  {
    id: "housing",
    title: "주거/부동산",
    keywords: ["임대주택", "부동산 규제", "층간소음", "정주 실태"],
  },
  {
    id: "economy_jobs",
    title: "경제/일자리",
    keywords: ["소상공인 지원", "일자리 창출", "창업 정책", "지역경제 활성화"],
  },
  {
    id: "education_care",
    title: "교육/보육",
    keywords: ["유·보육", "교육 인프라", "평생교육", "학급 규모"],
  },
  {
    id: "welfare_safety",
    title: "복지/안전",
    keywords: ["노인·장애인 돌봄", "아동·청소년 복지", "재난·안전", "사회서비스"],
  },
  {
    id: "culture_env",
    title: "문화/환경",
    keywords: ["문화시설·축제", "녹지·하천", "대기·수질", "쓰레기·재활용"],
  },
  {
    id: "health_medical",
    title: "보건/의료",
    keywords: ["의료 접근성", "건강검진", "정신건강", "응급·필수의료"],
  },
  {
    id: "admin_participation",
    title: "행정/참여",
    keywords: ["주민참여 예산", "정책 설명회", "민원·온라인 참여", "투명 행정"],
  },
  {
    id: "future_tech",
    title: "미래과학/신기술",
    keywords: ["스마트시티", "AI·데이터", "디지털 격차 해소", "혁신 R&D"],
  },
  {
    id: "regional_balance",
    title: "지역균형/상생",
    keywords: ["읍면·도심 균형", "지역 인센티브", "광역 연계 교통", "상생 사업"],
  },
] as const;

export const ONBOARDING_INTEREST_KEYWORDS = ONBOARDING_INTEREST_SECTIONS.flatMap((s) => [...s.keywords]) as [
  string,
  ...string[],
];

/** 카테고리 라벨만 (레거시·표시용) */
export const ONBOARDING_INTEREST_CATEGORIES = ONBOARDING_INTEREST_SECTIONS.map((s) => ({
  id: s.id,
  label: s.title,
}));

/** 참여 가능 활동 */
export const PARTICIPATION_ACTIVITY_OPTIONS = [
  { id: "survey_online", label: "설문조사 (온라인)" },
  { id: "fgi_offline", label: "FGI (오프라인 간담회)" },
  { id: "idi_interview", label: "IDI (심층 인터뷰)" },
] as const;

export const SEJONG_POLICY_INTEREST_GROUPS = ONBOARDING_INTEREST_SECTIONS.map((s) => ({
  id: s.id,
  title: s.title,
  keywords: s.keywords.join(", "),
  topics: [...s.keywords],
}));

export const INTEREST_CATEGORIES = ONBOARDING_INTEREST_SECTIONS.map((s) => ({
  category: s.title,
  icon: "📌",
  topics: [...s.keywords],
}));
