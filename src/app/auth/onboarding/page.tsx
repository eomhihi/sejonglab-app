import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { OnboardingForm } from "@/components/OnboardingForm";

export const metadata = {
  title: "추가 정보 입력 | 세종 패널",
  description: "세종시민 패널 참여를 위한 추가 정보를 입력해 주세요.",
};

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50/30 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            추가 정보 입력
          </h1>
          <p className="text-slate-600">
            세종시민 패널 참여를 위해 아래 정보를 입력해 주세요.
          </p>
        </div>
        <OnboardingForm userName={session.user?.name ?? undefined} />
      </div>
    </div>
  );
}
