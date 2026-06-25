import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SignInButtons } from "@/components/SignInButtons";

export const metadata = {
  title: "패널 신청 (로그인)",
  description: "카카오, 네이버, Google로 간편 로그인하세요.",
};

function normalizeAfterLogin(raw: string): string {
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/auth/signin")) {
    return "/auth/onboarding";
  }
  if (raw === "/onboarding") return "/auth/onboarding";
  return raw;
}

type Props = { searchParams: { callbackUrl?: string } };

export default async function SignInPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const raw =
    typeof searchParams?.callbackUrl === "string" ? searchParams.callbackUrl.trim() : "";
  const afterLogin = normalizeAfterLogin(raw);
  if (session) redirect(afterLogin);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-2">로그인</h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-center text-sm mb-6">
          카카오, 네이버, 구글 계정으로 간편 로그인
        </p>
        <SignInButtons callbackUrl={afterLogin} />
      </div>
    </div>
  );
}
