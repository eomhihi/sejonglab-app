import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 예전 URL(/onboarding) 접속 시 실제 온보딩 페이지로 통일
 * (업데이트된 폼은 /auth/onboarding 에만 존재)
 */
export default function OnboardingLegacyRedirect() {
  redirect("/auth/onboarding");
}
