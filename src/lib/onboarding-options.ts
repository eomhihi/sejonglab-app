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

/** 세종시 정책 중심 관심 카테고리 — title이 DB interests 배열에 저장됨 */
export const SEJONG_POLICY_INTEREST_GROUPS = [
  {
    id: "city_transport",
    title: "도시·교통",
    keywords: "BRT 노선 확충, 주차난 해소, 스마트시티, 도로 정비 등",
  },
  {
    id: "housing",
    title: "주거·부동산",
    keywords: "임대주택 보급, 부동산 규제·완화, 층간소음, 정주 여건 등",
  },
  {
    id: "economy_jobs",
    title: "경제·일자리",
    keywords: "여민전(지역화폐), 소상공인 지원, 청년 창업, 상가 공실 해결 등",
  },
  {
    id: "education_care",
    title: "교육·보육",
    keywords: "공동육아나눔터, 학교 환경 개선, 방과 후 활동, 돌봄 공백 등",
  },
  {
    id: "welfare_safety",
    title: "복지·안전",
    keywords: "노인·장애인 복지, 치안·방범, 재난 대응, 1인 가구 지원 등",
  },
  {
    id: "culture_env",
    title: "문화·관광·환경",
    keywords: "세종축제, 중앙공원 관리, 도서관 확충, 탄소중립·재활용 등",
  },
  {
    id: "health_medical",
    title: "보건·의료",
    keywords: "응급 의료 체계, 소아 야간 진료, 공공의료 확충, 전염병 대응 등",
  },
  {
    id: "admin_participation",
    title: "행정·참여",
    keywords: "주민자치회, 온라인 시민투표, 예산 낭비 감시, 친절도 등",
  },
] as const;

/** 참여 가능 활동 (중복 선택, DB participationActivities에 저장) */
export const PARTICIPATION_ACTIVITY_OPTIONS = [
  { id: "survey_online", label: "설문조사 (온라인)" },
  { id: "fgi_offline", label: "FGI (오프라인 간담회)" },
  { id: "idi_interview", label: "IDI (심층 인터뷰)" },
] as const;

/** 레거시 호환 (일부 페이지) */
export const INTEREST_CATEGORIES = SEJONG_POLICY_INTEREST_GROUPS.map((g) => ({
  category: g.title,
  icon: "📌",
  topics: [g.title],
}));
