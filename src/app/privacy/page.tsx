import Link from "next/link";
import { EFFECTIVE_DATE, PRIVACY_POLICY_FULL } from "@/../constants/policy";

export const metadata = {
  title: "개인정보 처리방침 | 세종랩",
  description: "세종랩 개인정보 처리방침",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            개인정보 처리방침
          </h1>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            홈으로
          </Link>
        </div>

        <article className="prose prose-slate max-w-none prose-headings:tracking-tight prose-p:leading-relaxed">
          <pre className="whitespace-pre-wrap break-words font-sans text-[15px] leading-7 text-slate-800 bg-white border border-slate-200 rounded-xl p-5 sm:p-7">
            {PRIVACY_POLICY_FULL}
          </pre>
          <p className="mt-6 text-sm text-slate-600">시행일자: {EFFECTIVE_DATE}</p>
        </article>
      </div>
    </main>
  );
}

