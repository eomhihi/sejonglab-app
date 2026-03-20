import { withAuth } from "next-auth/middleware";

/**
 * 로그인 필수 경로: 토큰 없으면 /auth/signin 으로 리다이렉트 (뒤로가기·bfcache로 캐시된 HTML 접근 방지)
 */
export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/main",
    "/main/:path*",
    "/auth/onboarding",
    "/onboarding",
  ],
};
