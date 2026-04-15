import { redirect } from "next/navigation";

export const metadata = {
  title: "패널 신청 | 세종랩",
};

export default function SignupPage() {
  // 기존 인증 흐름 유지: 실제 가입/로그인은 NextAuth sign-in 페이지로 통일
  redirect("/auth/signin");
}

