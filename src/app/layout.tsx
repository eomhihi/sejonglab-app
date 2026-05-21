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

/** 카카오·SNS 링크 미리보기 — 이미지 아래 이 한 줄만 노출 */
const OG_SHARE_LINE = "세종랩 세종의 미래를 데이터로 설계합니다 sejonglab.com";

export const metadata: Metadata = {
  metadataBase: new URL("https://sejonglab.com"),
  title: OG_SHARE_LINE,
  openGraph: {
    title: OG_SHARE_LINE,
    url: "https://sejonglab.com",
    images: [
      {
        url: "/images/og-share.png?v=20260523",
        width: 1200,
        height: 630,
        alt: "",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: OG_SHARE_LINE,
    images: ["/images/og-share.png?v=20260523"],
  },
  /** 제목 외 description·site_name 등 중복 문구 방지 */
  other: {
    "og:description": "",
    description: "",
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
      <body
        className={`antialiased min-h-screen overflow-x-hidden bg-background text-foreground ${montserrat.variable}`}
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
