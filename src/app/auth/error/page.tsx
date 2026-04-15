import Link from "next/link";

const messages: Record<string, string> = {
  Configuration: "서버 설정 오류가 있습니다. .env의 NEXTAUTH_URL을 확인해 주세요.",
  AccessDenied: "접근이 거부되었습니다.",
  Verification: "인증 링크가 만료되었거나 이미 사용되었습니다.",
  OAuthSignin: "로그인을 시작하는 중 오류가 발생했습니다.",
  OAuthCallback:
    "로그인 처리 중 오류가 발생했습니다. 카카오/Google/네이버 개발자 콘솔의 Redirect URI가 아래와 정확히 일치하는지 확인해 주세요.",
  OAuthCreateAccount: "계정 생성이 허용되지 않습니다.",
  EmailCreateAccount: "계정 생성이 허용되지 않습니다.",
  Callback:
    "로그인 콜백 처리 중 오류가 발생했습니다. Redirect URI 불일치, 프로필 동의 누락, 또는 세션/쿠키 문제일 수 있습니다. 아래 Redirect URI를 OAuth 콘솔에 등록했는지 확인해 주세요.",
  OAuthAccountNotLinked:
    "이 이메일로 이미 다른 로그인 방식(Google/카카오/네이버)이 등록되어 있습니다. 해당 방식으로 로그인하거나, 아래에서 다시 시도해 보세요.",
  EmailSignin: "이메일 로그인 링크를 확인해 주세요.",
  CredentialsSignin: "로그인 정보가 올바르지 않습니다.",
  SessionRequired: "로그인이 필요합니다.",
  Default: "로그인 중 오류가 발생했습니다. 다시 시도해 주세요.",
};

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3003";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const isUndefined = error === "undefined" || !error;
  const message = isUndefined
    ? "로그인 콜백 오류가 발생했습니다. 아래 순서대로 확인해 주세요."
    : messages[error] ?? messages.Default;
  const errorCode = error && error !== "undefined" ? error : "Unknown";

  const callbackUrls = {
    google: `${BASE_URL}/api/auth/callback/google`,
    kakao: `${BASE_URL}/api/auth/callback/kakao`,
    naver: `${BASE_URL}/api/auth/callback/naver`,
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-50 py-8">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">로그인 오류</h1>
        <p className="text-slate-600 mb-6">{message}</p>
        {errorCode !== "Unknown" && (
          <p className="text-xs text-slate-500 mb-4 font-mono">에러 코드: {errorCode}</p>
        )}

        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 text-left">
          <p className="text-sm font-semibold text-slate-700 mb-3">1. 브라우저 주소</p>
          <p className="text-sm text-slate-600 mb-4">
            반드시 <strong>http://localhost:3003</strong> 으로 접속하세요. (127.0.0.1 사용 시 콜백이 실패할 수 있습니다.)
          </p>

          <p className="text-sm font-semibold text-slate-700 mb-2">2. .env (next-app 폴더)</p>
          <p className="text-sm text-slate-600 mb-4 font-mono break-all">
            NEXTAUTH_URL={BASE_URL}
          </p>
          <p className="text-xs text-slate-500 mb-4">끝에 / 없이, 접속 주소와 동일하게 설정 후 서버 재시작</p>

          <p className="text-sm font-semibold text-slate-700 mb-2">3. OAuth 콘솔에 아래 URI를 그대로 등록</p>
          <p className="text-xs text-slate-500 mb-2">Google: Cloud Console → 사용자 인증 정보 → 승인된 리디렉션 URI</p>
          <p className="text-sm font-mono bg-slate-100 p-2 rounded mb-2 break-all select-all">
            {callbackUrls.google}
          </p>
          <p className="text-xs text-slate-500 mb-2">카카오: 개발자 콘솔 → 로그인 → Redirect URI</p>
          <p className="text-sm font-mono bg-slate-100 p-2 rounded mb-2 break-all select-all">
            {callbackUrls.kakao}
          </p>
          <p className="text-xs text-slate-500 mb-2">네이버: 개발자 센터 → API 설정 → Callback URL</p>
          <p className="text-sm font-mono bg-slate-100 p-2 rounded break-all select-all">
            {callbackUrls.naver}
          </p>
        </div>

        <Link
          href="/auth/signin"
          className="inline-flex items-center justify-center h-11 rounded-lg bg-primary-600 text-white font-medium px-6 hover:bg-primary-700 transition"
        >
          로그인 페이지로
        </Link>
        <Link
          href="/"
          className="block mt-3 text-sm text-slate-600 hover:underline"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
