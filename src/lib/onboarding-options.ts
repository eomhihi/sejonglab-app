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

/** 온보딩 관심 분야 10개 (DB User.interests 배열에 label 그대로 저장) */
export const ONBOARDING_INTEREST_CATEGORIES = [
  { id: "city_transport", label: "도시/교통" },
  { id: "housing", label: "주거/부동산" },
  { id: "economy_jobs", label: "경제/일자리" },
  { id: "education_care", label: "교육/보육" },
  { id: "welfare_safety", label: "복지/안전" },
  { id: "culture_env", label: "문화/환경" },
  { id: "health_medical", label: "보건/의료" },
  { id: "admin_participation", label: "행정/참여" },
  { id: "future_tech", label: "미래과학/신기술" },
  { id: "regional_balance", label: "지역균형/상생" },
] as const;

/** 2컬럼 구성: 상위 카테고리(선택 안함) 아래 하위 분야 5개씩 */
export const ONBOARDING_INTEREST_COLUMNS = [
  {
    upperLabel: "생활·경제",
    items: ONBOARDING_INTEREST_CATEGORIES.slice(0, 5),
  },
  {
    upperLabel: "사회·미래",
    items: ONBOARDING_INTEREST_CATEGORIES.slice(5, 10),
  },
] as const;

/** 레거시·타입 호환용 (폼에서는 ONBOARDING_INTEREST_CATEGORIES 사용) */
export const SEJONG_POLICY_INTEREST_GROUPS = ONBOARDING_INTEREST_CATEGORIES.map((c) => ({
  id: c.id,
  title: c.label,
  keywords: "",
  topics: [c.label],
}));

/** 참여 가능 활동 (중복 선택, DB participationActivities에 저장) */
export const PARTICIPATION_ACTIVITY_OPTIONS = [
  { id: "survey_online", label: "설문조사 (온라인)" },
  { id: "fgi_offline", label: "FGI (오프라인 간담회)" },
  { id: "idi_interview", label: "IDI (심층 인터뷰)" },
] as const;

export const INTEREST_CATEGORIES = ONBOARDING_INTEREST_CATEGORIES.map((c) => ({
  category: c.label,
  icon: "📌",
  topics: [c.label],
}));
