import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "@/components/SessionProvider";
import { MobileGuard } from "@/components/layout/MobileGuard";
import { NavigationScroll } from "@/components/NavigationScroll";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sejonglab.com"),
  title: "세종랩 | Sejong Lab",
  description: "세종의 미래를 데이터로 설계합니다",
  openGraph: {
    title: "세종랩 | Sejong Lab",
    description: "세종의 미래를 데이터로 설계합니다",
    url: "https://sejonglab.com",
    siteName: "세종랩",
    images: [
      {
        // social preview cache-busting (Kakao/Slack 등)
        url: "/og-image.png?v=20260420",
        width: 1200,
        height: 630,
        alt: "세종랩 로고",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "세종랩 | Sejong Lab",
    description: "세종의 미래를 데이터로 설계합니다",
    images: ["/og-image.png?v=20260420"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
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
          <NavigationScroll />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
