import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { SEJONG_LAB_SITE_URL } from "@/lib/sejonglab-url";

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
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
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

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-100 flex flex-col items-center text-center">
          <h2 className="text-sm font-bold text-slate-800 mb-1">세종랩 사이트 QR 코드</h2>
          <p className="text-xs text-slate-500 mb-5">스마트폰 카메라로 스캔하면 세종랩 홈페이지로 이동합니다.</p>
          <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200/80">
            <Image
              src="/images/sejonglab-qr.png"
              alt="세종랩 사이트 QR 코드"
              width={200}
              height={200}
              className="h-[200px] w-[200px]"
              priority
            />
          </div>
          <Link
            href={SEJONG_LAB_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 text-xs font-medium text-sejong-blue hover:underline tabular-nums"
          >
            {SEJONG_LAB_SITE_URL}
          </Link>
        </section>
      </div>
    </div>
  );
}
