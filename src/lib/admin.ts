/**
 * 관리자 권한 등급 (2단계)
 * 1) 대시보드 열람: /admin 접근 + 요약 카드 + 분석 대시보드(차트) 열람   → ADMIN_EMAILS (전원)
 * 2) 전체 관리: 위 + 회원 목록 조회/수정/삭제 + 엑셀 다운로드            → FULL_ADMIN_EMAILS
 *
 * 계정을 추가/제거하려면 아래 배열만 수정하면 됩니다(앱 전역에서 이 헬퍼를 사용).
 */
export const ADMIN_EMAILS = [
  "eomhihi007@gmail.com", // 전체 관리 + 대시보드 열람
  "mobiro1@naver.com", // 대시보드 열람
  "chy1142@gmail.com", // 대시보드 열람
] as const;

/** 전체 관리 권한(회원 목록 조회·수정·삭제, 엑셀 다운로드 등)을 가진 계정 목록 */
export const FULL_ADMIN_EMAILS = ["eomhihi007@gmail.com"] as const;

function normalize(email: string | null | undefined): string | null {
  if (!email) return null;
  return email.toLowerCase().trim();
}

function matches(list: readonly string[], email: string | null | undefined): boolean {
  const normalized = normalize(email);
  if (!normalized) return false;
  return list.some((e) => e.toLowerCase().trim() === normalized);
}

/** /admin 접근 가능 여부(= 대시보드 열람 권한). 모든 관리자 등급이 대시보드를 볼 수 있음 */
export function isAdminEmail(email: string | null | undefined): boolean {
  return matches(ADMIN_EMAILS, email);
}

/** 분석 대시보드(차트) 열람 권한 여부 — 2단계 체계에서는 모든 관리자가 열람 가능 */
export function isDashboardAdminEmail(email: string | null | undefined): boolean {
  return isAdminEmail(email);
}

/** 전체 관리 권한 여부(회원 데이터 조회·수정·삭제·엑셀 등) */
export function isFullAdminEmail(email: string | null | undefined): boolean {
  return matches(FULL_ADMIN_EMAILS, email);
}
