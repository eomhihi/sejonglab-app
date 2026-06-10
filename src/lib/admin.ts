/**
 * /admin 페이지에 접근 가능한 계정 목록(접근 권한).
 * 추가/제거하려면 이 배열만 수정하면 됩니다(앱 전역에서 이 헬퍼를 사용).
 */
export const ADMIN_EMAILS = [
  "eomhihi007@gmail.com",
  "mobiro1@naver.com",
] as const;

/**
 * 전체 관리 권한(회원 목록 조회·수정·삭제, 엑셀 다운로드 등)을 가진 계정 목록.
 * 여기에 없는 ADMIN_EMAILS 계정은 /admin 접근 시 요약 통계(가입자 수)만 볼 수 있습니다.
 */
export const FULL_ADMIN_EMAILS = ["eomhihi007@gmail.com"] as const;

function normalize(email: string | null | undefined): string | null {
  if (!email) return null;
  return email.toLowerCase().trim();
}

/** /admin 접근 가능 여부(접근 권한) */
export function isAdminEmail(email: string | null | undefined): boolean {
  const normalized = normalize(email);
  if (!normalized) return false;
  return ADMIN_EMAILS.some((e) => e.toLowerCase().trim() === normalized);
}

/** 전체 관리 권한 여부(회원 데이터 조회·수정·삭제·엑셀 등) */
export function isFullAdminEmail(email: string | null | undefined): boolean {
  const normalized = normalize(email);
  if (!normalized) return false;
  return FULL_ADMIN_EMAILS.some((e) => e.toLowerCase().trim() === normalized);
}
