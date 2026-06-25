/**
 * 관리자 권한 등급 (3단계)
 * 1) 대시보드 열람: /admin 접근 + 요약 카드 + 분석 대시보드(차트) 열람   → ADMIN_EMAILS (전원)
 * 2) 엑셀 다운로드: 회원 목록 열람 + 회원정보 엑셀 다운로드                    → EXCEL_EXPORT_ADMIN_EMAILS
 * 3) 전체 관리: 위 + 회원 정보 수정·삭제                                      → FULL_ADMIN_EMAILS
 *
 * 계정을 추가/제거하려면 아래 배열만 수정하면 됩니다(앱 전역에서 이 헬퍼를 사용).
 */
export const ADMIN_EMAILS = [
  "eomhihi007@gmail.com", // 전체 관리 + 엑셀 + 대시보드
  "mobiro1@naver.com", // 대시보드 열람
  "chy1142@gmail.com", // 엑셀 다운로드 + 대시보드 (삭제·수정 불가)
] as const;

/** 회원정보 엑셀 다운로드 권한(회원 목록 열람 포함) */
export const EXCEL_EXPORT_ADMIN_EMAILS = [
  "eomhihi007@gmail.com",
  "chy1142@gmail.com",
] as const;

/** 전체 관리 권한(회원 정보 수정·삭제)을 가진 계정 목록 */
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

/** 회원정보 엑셀 다운로드 권한 여부(회원 목록 열람 포함) */
export function isExcelExportAdminEmail(email: string | null | undefined): boolean {
  return matches(EXCEL_EXPORT_ADMIN_EMAILS, email);
}

/** 회원 목록 페이지(/admin/users) 접근 권한 여부 */
export function isMemberListAdminEmail(email: string | null | undefined): boolean {
  return isFullAdminEmail(email) || isExcelExportAdminEmail(email);
}

/** 전체 관리 권한 여부(회원 정보 수정·삭제) */
export function isFullAdminEmail(email: string | null | undefined): boolean {
  return matches(FULL_ADMIN_EMAILS, email);
}
