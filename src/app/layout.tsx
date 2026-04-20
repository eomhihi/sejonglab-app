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
  description:
    "세종시 정책의 근거를 만드는 데이터 전문가 그룹, 세종랩입니다. 시민의 목소리를 데이터로 연결합니다.",
  openGraph: {
    title: "세종랩 | Sejong Lab",
    description: "시민과 정책을 잇는 독립 리서치 플랫폼",
    url: "https://sejonglab.com",
    siteName: "세종랩",
    images: [
      {
        url: "/og-image.png",
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
    description: "시민과 정책을 잇는 독립 리서치 플랫폼",
    images: ["/og-image.png"],
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
