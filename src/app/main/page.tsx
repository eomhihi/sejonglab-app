import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "메인 | 세종랩",
  description: "세종시민 패널 메인",
};

export default async function MainPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">메인</h1>
        <p className="text-slate-600 mb-6">
          {session.user?.name ?? session.user?.email}님, 환영합니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
          >
            홈으로
          </Link>
          <Link
            href="/mypage"
            className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-sejong-blue text-white text-sm font-semibold hover:brightness-110 transition"
          >
            마이페이지
          </Link>
        </div>
      </div>
    </div>
  );
}
