import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SejongHeader } from "@/components/landing/SejongHeader";
import { KakaoChannelBanner } from "@/components/KakaoChannelBanner";
import { SejongLabQrCode } from "@/components/SejongLabQrCode";
import Link from "next/link";

export const metadata = {
  title: "가입 완료 | 세종랩",
  description: "세종랩 패널 회원가입이 완료되었습니다. 카카오톡 채널을 추가해 주세요.",
};

export default async function SignupCompletePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin?callbackUrl=" + encodeURIComponent("/signup/complete"));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <SejongHeader />
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#003666] mb-2">회원가입이 완료되었습니다</h1>
            <p className="text-slate-600 text-sm sm:text-base">
              {session.user?.name ? (
                <>
                  <span className="font-semibold text-sejong-blue">{session.user.name}</span>님, 세종랩 패널에 오신 것을
                  환영합니다.
                </>
              ) : (
                "세종랩 패널에 오신 것을 환영합니다."
              )}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 ring-1 ring-slate-100 flex flex-col items-center">
            <p className="text-sm font-semibold text-slate-800 mb-1 text-center">세종랩 사이트 바로가기</p>
            <p className="text-xs text-slate-500 mb-5 text-center">
              아래 QR 코드를 스캔하면 세종랩 홈페이지로 이동합니다.
            </p>
            <SejongLabQrCode />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-slate-800 mb-1 text-center">카카오톡 채널 친구 추가</p>
            <p className="text-xs text-slate-500 mb-5 text-center">
              채널을 추가하시면 맞춤형 설문 안내를 받아보실 수 있습니다.
            </p>
            <KakaoChannelBanner />
          </div>

          <Link
            href="/main"
            className="flex w-full items-center justify-center rounded-2xl bg-sejong-blue text-white font-bold py-4 shadow-lg hover:bg-sejong-blue-dark transition border border-sejong-blue-dark/30"
          >
            메인으로 이동하기
          </Link>
        </div>
      </div>
    </div>
  );
}
