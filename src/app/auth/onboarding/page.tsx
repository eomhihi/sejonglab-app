import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { OnboardingForm } from "@/components/OnboardingForm";
import { SejongHeader } from "@/components/landing/SejongHeader";
import { checkOnboardingStatus } from "@/lib/check-onboarding";

const ADMIN_EMAIL = "eomhihi007@gmail.com";

/** 배포·CDN이 온보딩 HTML을 오래 캐시하지 않도록 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "추가 정보 입력 | 세종 패널",
  description: "세종시민 패널 참여를 위한 추가 정보를 입력해 주세요.",
};

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin?callbackUrl=" + encodeURIComponent("/auth/onboarding"));
  }

  const isAdmin = session.user?.email === ADMIN_EMAIL;

  // 관리자 계정은 온보딩을 건너뛰고 바로 /admin으로 이동
  if (isAdmin) {
    redirect("/admin");
  }

  // 이미 온보딩 완료된 회원은 접근 차단 → 대시보드로
  const { onboardingCompleted } = await checkOnboardingStatus(session.user?.email);
  if (onboardingCompleted) {
    redirect("/mypage?notice=already_member");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <SejongHeader />
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#003666] mb-2">
            추가 정보 입력
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            세종시민 패널 참여를 위해 아래 정보를 입력해 주세요.
          </p>
        </div>
        <OnboardingForm
          userName={session.user?.name ?? undefined}
          userId={(session.user as { id?: string })?.id}
          userEmail={session.user?.email ?? undefined}
        />
      </div>
    </div>
  );
}
