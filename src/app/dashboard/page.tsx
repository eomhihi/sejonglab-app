import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { checkOnboardingStatus } from "@/lib/check-onboarding";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "대시보드 | 세종 패널",
  description: "세종시민 패널 대시보드",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const { onboardingCompleted, userData } = await checkOnboardingStatus(session.user?.email);
  if (!onboardingCompleted) redirect("/auth/onboarding");

  const interestTags =
    userData?.interests?.length && userData.interests.length > 0
      ? userData.interests
      : userData?.interestTopics ?? [];
  const participationActivities = userData?.participationActivities ?? [];

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
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-9 px-3 rounded-lg bg-gray-200 text-slate-700 text-sm font-medium hover:bg-gray-300 transition"
            >
              내 정보 수정
            </Link>
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
                  <div className="flex justify-between">
                    <dt className="text-slate-500">직업</dt>
                    <dd className="font-medium text-slate-900 text-right max-w-[70%]">
                      {userData.occupation ?? "-"}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          {userData && interestTags.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-semibold text-slate-900 mb-4">관심 정책 분야</h2>
              <div className="flex flex-wrap gap-2">
                {interestTags.map((topic: string) => (
                  <span
                    key={topic}
                    className="px-3 py-1 text-sm bg-[#004B8D]/10 text-[#004B8D] rounded-full font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              {participationActivities.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">참여 가능 활동</h3>
                  <div className="flex flex-wrap gap-2">
                    {participationActivities.map((a: string) => (
                      <span
                        key={a}
                        className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-full"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-10 flex justify-end">
          <button
            type="button"
            onClick={() => {
              const ok = confirm("정말 탈퇴하시겠습니까?");
              if (!ok) return;
              alert("회원 탈퇴 기능은 준비 중입니다. 필요 시 관리자에게 요청해 주세요.");
            }}
            className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-gray-200 text-slate-700 text-sm font-semibold hover:bg-gray-300 transition"
          >
            회원 탈퇴
          </button>
        </div>
      </main>
    </div>
  );
}
