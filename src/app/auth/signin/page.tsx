import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SignInButtons } from "@/components/SignInButtons";

export const metadata = {
  title: "패널 신청 (로그인)",
  description: "Google, 카카오, 네이버로 간편 로그인하세요.",
};

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-2">로그인</h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-center text-sm mb-6">
          Google, 카카오, 네이버 계정으로 간편 로그인
        </p>
        <SignInButtons />
      </div>
    </div>
  );
}
