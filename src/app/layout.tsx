import type { Metadata } from "next";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "세종시민 패널 모집 | 에어봇 기반 설문·리포트 통합 관리",
  description:
    "세종시민 패널에 참여하세요. 에어봇(AirBBot) 클라우드로 설문 설계부터 리포트까지 통합 관리하며, 시민 의견을 정책에 반영합니다.",
  openGraph: {
    title: "세종시민 패널 모집",
    description:
      "클라우드 기반 설문 설계부터 리포트까지 통합 관리. 세종시민 여러분의 목소리를 들려주세요.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen bg-background text-foreground">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
