import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { OnboardingForm } from "@/components/OnboardingForm";
import { SejongHeader } from "@/components/landing/SejongHeader";

const ADMIN_EMAIL = "eomhihi007@gmail.com";

export const metadata = {
  title: "추가 정보 입력 | 세종 패널",
  description: "세종시민 패널 참여를 위한 추가 정보를 입력해 주세요.",
};

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const isAdmin = session.user?.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-[#004B8D]/5">
      <SejongHeader />
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* 관리자 전용: 온보딩 건너뛰고 /admin 바로가기 */}
        {isAdmin && (
          <div className="mb-6">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-[#004B8D] text-white font-bold hover:bg-[#003666] transition shadow-lg"
            >
              관리자 대시보드로 바로가기
            </Link>
          </div>
        )}
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
