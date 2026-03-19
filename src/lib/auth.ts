import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import { PrismaAdapter } from "@auth/prisma-adapter";

/**
 * 이전 잘못된 카카오 인증 세션이 남아 있으면: .env의 NEXTAUTH_SECRET을 변경하거나
 * 브라우저에서 next-auth 관련 쿠키를 삭제한 뒤 다시 로그인하면 리프레시됨.
 */

/** NEXTAUTH_URL 정규화 (트레일링 슬래시 제거) — redirect_uri·쿠키 도메인과 일치 */
function normalizeAuthUrl(): string {
  const fromEnv = process.env.NEXTAUTH_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const v = process.env.VERCEL_URL;
  if (v) return `https://${v.replace(/\/$/, "")}`;
  return "http://localhost:3003";
}

const authBaseUrl = normalizeAuthUrl();
if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL !== authBaseUrl) {
  process.env.NEXTAUTH_URL = authBaseUrl;
  console.log("[auth] NEXTAUTH_URL 정규화:", authBaseUrl);
}
// 배포 환경 NEXTAUTH_URL 검증 (Vercel: https://sejonglab-app.vercel.app)
const expectedProdUrl = "https://sejonglab-app.vercel.app";
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  const actual = process.env.NEXTAUTH_URL ?? authBaseUrl;
  console.log("[auth] NEXTAUTH_URL 확인:", {
    actual,
    expected: expectedProdUrl,
    match: actual.replace(/\/$/, "") === expectedProdUrl,
  });
}

const isHttps = authBaseUrl.startsWith("https://");
const cookieSecure = isHttps;

const kakaoId = process.env.KAKAO_CLIENT_ID;
const kakaoSecret = process.env.KAKAO_CLIENT_SECRET;
const naverId = process.env.NAVER_CLIENT_ID;
const naverSecret = process.env.NAVER_CLIENT_SECRET;

function getAdapter(): NextAuthOptions["adapter"] {
  if (!process.env.DATABASE_URL) return undefined;
  try {
    const { prisma } = require("./prisma");
    return PrismaAdapter(prisma) as NextAuthOptions["adapter"];
  } catch {
    return undefined;
  }
}

const providers: NextAuthOptions["providers"] = [];
const linkByEmail = { allowDangerousEmailAccountLinking: true } as const;

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Object.assign(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
      linkByEmail
    )
  );
}

if (kakaoId && kakaoSecret) {
  console.log("[auth] Kakao: clientId·clientSecret 환경변수 로드됨 (scope 강제 주입)");
  providers.push(
    Object.assign(
      KakaoProvider({
        clientId: kakaoId,
        clientSecret: kakaoSecret,
        allowDangerousEmailAccountLinking: true,
        authorization: {
          url: "https://kauth.kakao.com/oauth/authorize",
          params: {
            scope: "profile_nickname account_email",
          },
        },
        profile(profile: Record<string, unknown>) {
          const p = profile as {
            id?: string | number;
            kakao_account?: {
              email?: string | null;
              profile?: { nickname?: string; profile_image_url?: string };
            };
          };
          const id = (p?.id != null ? String(p.id) : "") || "unknown";
          const name =
            (p?.kakao_account?.profile?.nickname?.trim() ?? "") || "카카오유저";
          const email =
            (p?.kakao_account?.email?.trim() ?? "") || `kakao_${id}@temp.com`;
          const image = p?.kakao_account?.profile?.profile_image_url ?? null;
          return {
            id,
            name,
            email,
            image: image ?? null,
          };
        },
      }),
      linkByEmail
    )
  );
} else if (kakaoId || kakaoSecret) {
  console.warn("[auth] Kakao: KAKAO_CLIENT_ID 또는 KAKAO_CLIENT_SECRET이 비어 있음. 둘 다 .env에 설정해야 합니다.");
}

if (naverId && naverSecret) {
  providers.push(
    Object.assign(
      NaverProvider({
        clientId: naverId,
        clientSecret: naverSecret,
      }),
      linkByEmail
    )
  );
}

// 카카오 프로바이더 검증: clientId·clientSecret·리다이렉트 URI 확인 (디버깅/배포 시 카카오 콘솔과 대조)
const kakaoRedirectUri = `${authBaseUrl}/api/auth/callback/kakao`;
if (kakaoId && kakaoSecret) {
  console.log("[auth] Kakao 설정:", {
    hasClientId: !!kakaoId,
    hasClientSecret: !!kakaoSecret,
    redirectUri: kakaoRedirectUri,
    note: "카카오 개발자 콘솔 → 로그인 → Redirect URI에 위 redirectUri를 정확히 등록해야 합니다.",
  });
}
if (process.env.NODE_ENV === "development") {
  console.log("[auth] 등록된 OAuth providers:", providers.map((p) => (p as { id?: string }).id));
}

// 카카오 등 OAuth 리다이렉트 호환: sameSite=lax, path=/ (strict·다른 path는 콜백 시 쿠키 미전송으로 실패 가능)
const cookieOptions = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  path: "/" as const,
  secure: cookieSecure,
  maxAge: 60 * 15,
};

export const authOptions: NextAuthOptions = {
  debug: true,
  adapter: getAdapter(),
  providers,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  useSecureCookies: cookieSecure,
  cookies: {
    pkceCodeVerifier: {
      name: cookieSecure ? "__Secure-next-auth.pkce.code_verifier" : "next-auth.pkce.code_verifier",
      options: cookieOptions,
    },
    state: {
      name: cookieSecure ? "__Secure-next-auth.state" : "next-auth.state",
      options: cookieOptions,
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const provider = account?.provider ?? "";
      if (provider === "kakao") {
        console.log("🔥 [카카오 로그인 시도]:", { user, account, profile });
      }
      try {
        console.log("[auth] signIn callback:", {
          provider,
          userId: user?.id,
          hasEmail: !!user?.email,
          hasName: !!user?.name,
        });
        if (provider === "kakao") {
          if (!user?.email) {
            console.error("[Auth Error] Kakao signIn: email 없음 — profile/동의항목 확인", {
              accountId: account?.providerAccountId,
              profileKeys: profile ? Object.keys(profile as Record<string, unknown>) : [],
            });
            return false;
          }
        }
        return true;
      } catch (error) {
        console.error("❌ [카카오 DB 저장 에러]:", error);
        console.error("NextAuth 콜백 에러:", error);
        console.error("[Auth Error] signIn callback 예외:", error instanceof Error ? (error as Error).message : String(error), error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.picture = user.image ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as { id?: string; email?: string | null; name?: string | null };
        u.id = token.id ?? "";
        u.email = token.email ?? null;
        u.name = token.name ?? null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const canonical = authBaseUrl.replace(/\/$/, "");
      const b = baseUrl.replace(/\/$/, "");
      let finalUrl: string;

      if (b !== canonical) {
        console.warn("[auth] redirect: baseUrl 불일치 가능성", { baseUrl: b, NEXTAUTH_URL: canonical });
      }

      if (url.includes("error=")) {
        const err = (url.split("error=")[1]?.split("&")[0] ?? "Callback").replace(/#.*$/, "");
        finalUrl = `${canonical}/auth/error?error=${encodeURIComponent(err)}`;
        console.error("[Auth Error] OAuth redirect에 error 포함 → /auth/error로 이동:", err, { incomingUrl: url, finalUrl });
      } else if (url.includes("/api/auth/callback") && !url.includes("error=")) {
        finalUrl = `${canonical}/auth/onboarding`;
        console.log("[auth] redirect: OAuth 콜백 성공 → callbackUrl /onboarding으로 이동:", { incomingUrl: url, finalUrl });
      } else {
        finalUrl = url.startsWith(canonical) ? url : url.startsWith("/") ? `${canonical}${url}` : canonical;
        if (process.env.NODE_ENV === "development") {
          console.log("[auth] redirect: 기타:", { url, baseUrl, finalUrl });
        }
      }

      return finalUrl;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log("[auth] events.signIn:", {
        provider: account?.provider,
        isNewUser,
        userId: user?.id,
        hasEmail: !!user?.email,
      });
    },
  },
  // NEXTAUTH_SECRET 필수. 변경 시 기존 세션/쿠키 무효화 → 사용자는 재로그인 필요
  secret:
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === "development" ? "dev-secret-min-32-characters-long-for-nextauth" : undefined),
};

// App Router + Vercel 등에서 호스트 검증 완화 (next-auth 타입에 없을 수 있음)
(authOptions as NextAuthOptions & { trustHost?: boolean }).trustHost = true;
