import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import { PrismaAdapter } from "@auth/prisma-adapter";

// NEXTAUTH_URL 누락 시 Vercel에서는 VERCEL_URL로 자동 보정
const _vercelUrl = process.env.VERCEL_URL;
if (!process.env.NEXTAUTH_URL && _vercelUrl) {
  process.env.NEXTAUTH_URL = `https://${_vercelUrl}`;
  console.log("[auth] NEXTAUTH_URL 미설정 → VERCEL_URL로 보정:", process.env.NEXTAUTH_URL);
}

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
// 같은 이메일로 Google/카카오/네이버 여러 소셜 로그인 시 한 계정으로 묶기 위해 필요 (OAuthAccountNotLinked 방지)
const linkByEmail = { allowDangerousEmailAccountLinking: true } as const;

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Object.assign(GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }), linkByEmail)
  );
}
// Kakao: 표준 Provider 설정 + profile 매핑만 사용 (Google/네이버와 동일한 형태)
if (kakaoId && kakaoSecret) {
  providers.push(
    Object.assign(
      KakaoProvider({
        clientId: kakaoId,
        clientSecret: kakaoSecret,
        authorization: {
          params: {
            scope: "profile_nickname account_email",
            // 카카오 OAuth 동의 화면/자동 로그인 플로우는 카카오 개발자 콘솔의
            // "동의 화면" 및 앱 설정에 더 크게 의존합니다.
            // 여기서는 scope만 명시하고, 추가 prompt 옵션은 주지 않아
            // 브라우저/카카오톡에 이미 로그인된 경우 곧바로 동의 화면이 나오도록 위임합니다.
          },
        },
        profile(profile: Record<string, unknown>) {
          const p = profile as {
            id?: string | number;
            kakao_account?: { email?: string | null; profile?: { nickname?: string; profile_image_url?: string } };
          };
          const rawId = p.id != null ? String(p.id) : "";
          const account = p.kakao_account ?? {};
          const accountProfile = account.profile ?? {};

          const email = account.email?.trim() || null;
          const name = accountProfile.nickname ?? null;
          const image = accountProfile.profile_image_url ?? null;

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
// 네이버: 기본 프로필 사용. 응답이 response.id, response.email, response.name 등으로 이미 표준 형태라 별도 profile 불필요.
if (naverId && naverSecret) {
  providers.push(
    Object.assign(NaverProvider({
      clientId: naverId,
      clientSecret: naverSecret,
    }), linkByEmail)
  );
}

if (process.env.NODE_ENV === "development") {
  console.log("[auth] 등록된 OAuth providers:", providers.map((p) => (p as { id?: string }).id));
}

export const authOptions: NextAuthOptions = {
  adapter: getAdapter(),
  providers,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  // signIn: 인증 필요 시 이동할 페이지. error: OAuth/콜백 실패 시 이동할 페이지 (예: ?error=Callback).
  // 리다이렉트 루프 원인은 보통 콜백 실패 → /auth/error → (에러 페이지에서 다시 signin으로) 반복이므로, signIn 페이지 자체보다는 콜백 실패 원인 해결이 필요함.
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const provider = account?.provider ?? "";
      console.log("[auth] signIn callback:", {
        provider,
        userId: user?.id,
        hasEmail: !!user?.email,
        email: user?.email ? "(있음)" : "(없음)",
        hasName: !!user?.name,
      });
      if (provider === "kakao") {
        // 로컬 테스트용: 카카오 OAuth 콜백까지 도달했다는 것은
        // 사용자가 브라우저/카카오톡에서 로그인 상태이거나, ID/PW 입력을 완료했다는 뜻입니다.
        console.log("[auth][kakao] signIn: 브라우저에서 카카오 인증 완료. profile keys:", {
          profileKeys: profile ? Object.keys(profile as Record<string, unknown>) : [],
        });
      }
      return true;
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
      console.log("[auth] redirect callback:", { url, baseUrl, hasError: url.includes("error=") });
      if (url.includes("error=")) {
        console.log("[auth] redirect: 에러 포함 URL → 에러 페이지로 유지. error param:", url.split("error=")[1]?.split("&")[0]);
      }
      // 로그인 성공 후 항상 온보딩으로 이동
      if (url.includes("/api/auth/callback") && !url.includes("error=")) return `${baseUrl}/onboarding`;
      // 같은 origin이면 허용
      if (url.startsWith(baseUrl)) return url;
      // 상대 경로 허용
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === "development" ? "dev-secret-min-32-characters-long-for-nextauth" : undefined),
  
  debug: process.env.NODE_ENV === "development",
};

