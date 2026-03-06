import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { checkOnboardingStatus } from "@/lib/check-onboarding";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export const metadata = {
  title: "대시보드 | 세종 패널",
  description: "세종시민 패널 대시보드",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const { onboardingCompleted, userData } = await checkOnboardingStatus(session.user?.email);
  if (!onboardingCompleted) redirect("/auth/onboarding");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-primary-600">
            세종 패널
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {session.user?.name ?? session.user?.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">대시보드</h1>
        <p className="text-slate-600 mb-8">
          세종시민 패널에 참여해 주셔서 감사합니다.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900 mb-4">내 정보</h2>
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">이름</dt>
                <dd className="font-medium text-slate-900">{session.user?.name ?? "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">이메일</dt>
                <dd className="font-medium text-slate-900">{session.user?.email ?? "-"}</dd>
              </div>
              {userData && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">성별</dt>
                    <dd className="font-medium text-slate-900">
                      {userData.gender === "male" ? "남성" : userData.gender === "female" ? "여성" : "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">연령대</dt>
                    <dd className="font-medium text-slate-900">{userData.ageGroup ?? "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">거주지역</dt>
                    <dd className="font-medium text-slate-900">{userData.region ?? "-"}</dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          {userData && userData.interestTopics && userData.interestTopics.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-semibold text-slate-900 mb-4">관심 분야</h2>
              <div className="flex flex-wrap gap-2">
                {userData.interestTopics.map((topic: string) => (
                  <span
                    key={topic}
                    className="px-3 py-1 text-sm bg-primary-50 text-primary-700 rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900 mb-2">참여 가능한 설문</h2>
          <p className="text-slate-500 text-sm">
            아직 참여 가능한 설문이 없습니다. 새로운 설문이 등록되면 알려드리겠습니다.
          </p>
        </div>
      </main>
    </div>
  );
}
