import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "@/components/SessionProvider";
import { MobileGuard } from "@/components/layout/MobileGuard";
import { NavigationScroll } from "@/components/NavigationScroll";
import { NoticeToast } from "@/components/NoticeToast";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sejonglab.com"),
  title: "세종랩",
  description: "세종의 미래를 데이터로 설계합니다",
  openGraph: {
    title: "세종랩",
    description: "세종의 미래를 데이터로 설계합니다",
    url: "https://sejonglab.com",
    images: [
      {
        url: "/images/og-share.png?v=20260523",
        width: 1200,
        height: 630,
        alt: "세종랩",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "세종랩",
    description: "세종의 미래를 데이터로 설계합니다",
    images: ["/images/og-share.png?v=20260523"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
} as const;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ko">
      <head>
        {/* Pretendard: 한/영 혼용 가독성 최적 본문 서체 (가변 폰트, 동적 서브셋) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body
        className={`antialiased min-h-screen overflow-x-hidden bg-background text-foreground break-keep tracking-tight ${montserrat.variable}`}
      >
        <MobileGuard />
        <SessionProvider session={session}>
          <NoticeToast />
          <NavigationScroll />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
