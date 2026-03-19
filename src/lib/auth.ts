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
  providers.push(
    Object.assign(
      KakaoProvider({
        clientId: kakaoId,
        clientSecret: kakaoSecret,
        // authorization params 비움 → 카카오 기본 '간편 로그인' 동작 (through_account 강제 로그인 방지)
        authorization: {
          url: "https://kauth.kakao.com/oauth/authorize",
          params: {},
        },
        checks: ["pkce", "state"],
        profile(profile: Record<string, unknown>) {
          const p = profile as {
            id?: string | number;
            kakao_account?: { email?: string | null; profile?: { nickname?: string; profile_image_url?: string } };
          };
          const rawId = p.id != null ? String(p.id) : "";
          const account = p.kakao_account ?? {};
          const accountProfile = account.profile ?? {};
          const rawEmail = account.email?.trim() || null;
          const name = accountProfile.nickname ?? null;
          const image = accountProfile.profile_image_url ?? null;
          // 이메일 미동의 시 어댑터/세션 생성 실패·루프 방지용 (고유 식별)
          const email =
            rawEmail && rawEmail.length > 0
              ? rawEmail
              : rawId
                ? `kakao_${rawId}@users.noemail.local`
                : null;

          return {
            id: rawId,
            email,
            name,
            image,
          };
        },
      }),
      linkByEmail
    )
  );
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

if (process.env.NODE_ENV === "development") {
  console.log("[auth] 등록된 OAuth providers:", providers.map((p) => (p as { id?: string }).id));
  console.log("[auth] Kakao callback URL (카카오 콘솔과 동일해야 함):", `${authBaseUrl}/api/auth/callback/kakao`);
}

const pkceCookieOptions = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  path: "/",
  secure: cookieSecure,
};

export const authOptions: NextAuthOptions = {
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
      options: pkceCookieOptions,
    },
    state: {
      name: cookieSecure ? "__Secure-next-auth.state" : "next-auth.state",
      options: pkceCookieOptions,
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const provider = account?.provider ?? "";
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
      } catch (e) {
        console.error("[Auth Error] signIn callback 예외:", e instanceof Error ? e.message : String(e), e);
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
      if (b !== canonical) {
        console.warn("[auth] redirect: baseUrl 불일치 가능성", { baseUrl: b, NEXTAUTH_URL: canonical });
      }
      if (url.includes("error=")) {
        const err = url.split("error=")[1]?.split("&")[0];
        console.error("[Auth Error] OAuth redirect에 error 포함:", err, { url });
        return url.startsWith("/") ? `${canonical}${url}` : url;
      }
      // OAuth 콜백 성공 직후: 온보딩 페이지로 바로 이동 (/onboarding 한 번 더 거치지 않음 → 세션 누락·루프 완화)
      if (url.includes("/api/auth/callback") && !url.includes("error=")) {
        return `${canonical}/auth/onboarding`;
      }
      if (url.startsWith(canonical)) return url;
      if (url.startsWith("/")) return `${canonical}${url}`;
      return canonical;
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
  debug: process.env.NODE_ENV === "development",
};

// App Router + Vercel 등에서 호스트 검증 완화 (next-auth 타입에 없을 수 있음)
(authOptions as NextAuthOptions & { trustHost?: boolean }).trustHost = true;
