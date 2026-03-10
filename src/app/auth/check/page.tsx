import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { checkOnboardingStatus } from "@/lib/check-onboarding";

// 관리자 프리패스: 이 이메일은 모든 온보딩 체크 무시 후 즉시 /admin 리다이렉트
const ADMIN_EMAIL = "eomhihi007@gmail.com";

export default async function AuthCheckPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // 관리자 계정: 온보딩 체크 없이 즉시 /admin
  if (session.user?.email === ADMIN_EMAIL) {
    redirect("/admin");
  }

  const { onboardingCompleted } = await checkOnboardingStatus(session.user?.email);

  if (onboardingCompleted) {
    redirect("/dashboard");
  } else {
    redirect("/auth/onboarding");
  }
}
