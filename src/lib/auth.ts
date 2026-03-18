import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import { PrismaAdapter } from "@auth/prisma-adapter";

// 필수 환경 변수: NEXTAUTH_URL, NEXTAUTH_SECRET
// NextAuth는 redirect_uri를 [NEXTAUTH_URL]/api/auth/callback/[provider] 로 생성함.
// 카카오 KOE006 = redirect_uri 불일치 → 카카오 개발자 콘솔에 아래와 동일한 URL 등록 필요.

// NEXTAUTH_URL 누락 시 Vercel에서는 VERCEL_URL로 자동 보정 (배포 도메인과 일치시키기 위함)
const _vercelUrl = process.env.VERCEL_URL;
if (!process.env.NEXTAUTH_URL && _vercelUrl) {
  process.env.NEXTAUTH_URL = `https://${_vercelUrl}`;
  console.log("[auth] NEXTAUTH_URL 미설정 → VERCEL_URL로 보정:", process.env.NEXTAUTH_URL);
}

const baseUrl = process.env.NEXTAUTH_URL ?? "";
const kakaoRedirectUri = baseUrl ? `${baseUrl.replace(/\/$/, "")}/api/auth/callback/kakao` : "";

// 카카오 개발자 콘솔에 등록할 Redirect URI와 실제 사용 값이 일치하는지 확인용 로그
console.log("[auth] Kakao redirect_uri (카카오 콘솔에 이 값 그대로 등록):", kakaoRedirectUri || "(NEXTAUTH_URL 없음)");
if (!baseUrl) {
  console.warn("[auth] NEXTAUTH_URL이 없어 OAuth redirect_uri가 비정상일 수 있음. Vercel이면 Environment Variables에 NEXTAUTH_URL=https://sejonglab-app.vercel.app 설정.");
}
const kakaoId = process.env.KAKAO_CLIENT_ID;
const kakaoSecret = process.env.KAKAO_CLIENT_SECRET;
// KAKAO_CLIENT_ID / KAKAO_CLIENT_SECRET이 process.env로 전달되는지 로그 (시크릿 값은 노출하지 않음)
console.log("[auth] Kakao env 전달 여부:", {
  KAKAO_CLIENT_ID: kakaoId
    ? `length=${kakaoId.length}, prefix=${kakaoId.slice(0, 4)}...`
    : "(undefined)",
  KAKAO_CLIENT_SECRET: kakaoSecret ? "설정됨 (length=" + kakaoSecret.length + ")" : "(undefined)",
});
if (!kakaoId || !kakaoSecret) {
  console.log("[auth] Kakao provider 미등록: ID 또는 SECRET 누락");
}
const naverId = process.env.NAVER_CLIENT_ID;
const naverSecret = process.env.NAVER_CLIENT_SECRET;
if (!naverId || !naverSecret) {
  console.log("[auth] Naver env:", {
    NAVER_CLIENT_ID: naverId ? "(설정됨)" : "(undefined)",
    NAVER_CLIENT_SECRET: naverSecret ? "(설정됨)" : "(undefined)",
  });
}

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
if (kakaoId && kakaoSecret) {
  providers.push(
    Object.assign(KakaoProvider({
      clientId: kakaoId,
      clientSecret: kakaoSecret,
      // NextAuth Kakao 기본 authorization가 "?scope" 만 붙어 있어 scope가 비어 감. url+params 로 덮어서 명시.
      authorization: {
        url: "https://kauth.kakao.com/oauth/authorize",
        params: {
          scope: "profile_nickname account_email",
        },
      },
      // 카카오 프로필 → NextAuth User → DB User 매핑:
      // - User.id: Prisma가 생성(cuid). Account.providerAccountId에 카카오 id 저장.
      // - User.name, User.email, User.image: 아래 profile 반환값으로 채움.
      // - 이메일은 kakao_account.email (카카오에서 필수 동의 설정 시 제공됨)
      profile(profile: Record<string, unknown>) {
        const p = profile as {
          id?: string | number;
          kakao_account?: { email?: string | null; profile?: { nickname?: string; profile_image_url?: string } };
          properties?: { nickname?: string; profile_image?: string };
        };
        const account = p.kakao_account ?? {};
        const accountProfile = account.profile ?? {};
        // 카카오 id는 숫자일 수 있어 항상 문자열로 변환
        const rawId = p.id != null ? String(p.id) : "";
        const rawEmail = account.email?.trim() || null;
        const name = accountProfile.nickname ?? p.properties?.nickname ?? null;
        const image = accountProfile.profile_image_url ?? p.properties?.profile_image ?? null;

        // 이메일이 없을 경우(권한 미동의/미제공 대비) fallback 이메일 생성
        // 요청 사항: profile.kakao_account?.email || `kakao_${profile.id}@sejonglab.user`
        const email = rawEmail && rawEmail.length > 0 ? rawEmail : rawId ? `kakao_${rawId}@sejonglab.user` : null;
        console.log("[auth] Kakao profile:", {
          kakaoId: rawId || "(missing)",
          hasEmail: !!email,
          email: rawEmail ? "(실제 이메일)" : email ? "(fallback 이메일)" : "(없음)",
        });

        return {
          id: rawId,
          name,
          email,
          image,
        };
      },
    }), linkByEmail)
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
        // 카카오는 이메일이 없을 수 있으므로(권한/동의 이슈), profile에서 fallback 이메일을 넣어두었고 여기서는 로그인 허용
        if (!user?.email) {
          console.log("[auth] Kakao signIn: 이메일 누락 (fallback 생성 실패 가능). 로그인은 허용하고 후속 플로우에서 보완.", {
            userId: user?.id,
            accountId: account?.providerAccountId,
            profileKeys: profile ? Object.keys(profile as Record<string, unknown>) : [],
          });
        }

        // 과거 테스트로 placeholder 이메일이 DB에 남아있다면, 재로그인 시 실제 이메일로 업데이트 시도
        // (providerAccountId로 계정을 찾고 userId를 알아낸 뒤 user.email을 업데이트)
        try {
          if (process.env.DATABASE_URL && account?.providerAccountId) {
            const { prisma } = await import("./prisma");
            const acct = await prisma.account.findUnique({
              where: {
                provider_providerAccountId: {
                  provider: "kakao",
                  providerAccountId: String(account.providerAccountId),
                },
              },
              select: { userId: true, user: { select: { email: true } } },
            });

            const currentEmail = acct?.user?.email ?? null;
            const nextEmail = user.email ? user.email.toLowerCase().trim() : null;
            const isPlaceholder = typeof currentEmail === "string" && currentEmail.includes("@sejonglab.user");

            if (acct?.userId && nextEmail && (isPlaceholder || !currentEmail || currentEmail !== nextEmail)) {
              await prisma.user.update({
                where: { id: acct.userId },
                data: { email: nextEmail },
              });
              console.log("[auth] Kakao signIn: DB 이메일 업데이트 완료", {
                userId: acct.userId,
                from: currentEmail ? "(있음)" : "(없음)",
                to: "(실제 이메일)",
              });
            }
          }
        } catch (e) {
          console.log("[auth] Kakao signIn: DB 이메일 업데이트 실패(로그인 자체는 진행)", {
            error: e instanceof Error ? e.message : String(e),
          });
        }

        return true;
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
      // 로그인 성공 후 온보딩 확인을 위해 /auth/check로 이동
      if (url.includes("/api/auth/callback") && !url.includes("error=")) {
        const target = `${baseUrl}/auth/check`;
        console.log("[auth] redirect: 콜백 성공 →", target);
        return target;
      }
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

