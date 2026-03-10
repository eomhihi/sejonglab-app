import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";

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
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-[#004B8D] hover:underline"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
