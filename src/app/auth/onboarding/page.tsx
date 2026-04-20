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

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: { edit?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin?callbackUrl=" + encodeURIComponent("/auth/onboarding"));
  }

  const isAdmin = session.user?.email === ADMIN_EMAIL;

  // 관리자 계정은 온보딩을 건너뛰고 바로 /admin으로 이동
  if (isAdmin) {
    redirect("/admin");
  }

  const allowEdit = searchParams?.edit === "1";
  const pageTitle = allowEdit ? "추가 정보 수정" : "추가 정보 입력";
  const pageDesc = allowEdit
    ? "기존 정보를 확인하고 필요한 항목을 수정해 주세요."
    : "세종시민 패널 참여를 위해 아래 정보를 입력해 주세요.";

  // 온보딩 완료 회원은 기본적으로 접근 차단하되, edit=1이면 수정 허용(마이페이지에서 진입)
  const { onboardingCompleted, userData } = await checkOnboardingStatus(session.user?.email);
  if (onboardingCompleted && !allowEdit) {
    redirect("/mypage?notice=already_member");
  }

  const initialValues =
    allowEdit && userData
      ? {
          gender:
            userData.gender === "male" || userData.gender === "female"
              ? (userData.gender as "male" | "female")
              : undefined,
          ageGroup: userData.ageGroup ?? undefined,
          region: userData.region ?? undefined,
          occupation: userData.occupation ?? undefined,
          interests:
            userData.interests?.length && userData.interests.length > 0
              ? userData.interests
              : userData.interestTopics ?? [],
          participationActivities: userData.participationActivities ?? [],
        }
      : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <SejongHeader />
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#003666] mb-2">
            {pageTitle}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            {pageDesc}
          </p>
        </div>
        <OnboardingForm
          userName={session.user?.name ?? undefined}
          userId={(session.user as { id?: string })?.id}
          userEmail={session.user?.email ?? undefined}
          initialValues={initialValues}
          mode={allowEdit ? "edit" : "create"}
        />
      </div>
    </div>
  );
}
