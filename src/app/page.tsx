import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SejongHeader } from "@/components/landing/SejongHeader";
import { SejongHeroSection } from "@/components/landing/SejongHeroSection";
import { SejongFeatureCards } from "@/components/landing/SejongFeatureCards";
import { AirBBotFeatureSection } from "@/components/landing/AirBBotFeatureSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { CTASection } from "@/components/landing/CTASection";
import { SejongFooter } from "@/components/landing/SejongFooter";
import { NewsTicker, NewsSection } from "@/components/landing/NewsTicker";
import { getNews } from "@/lib/get-news";

// Footer 「관리자」 링크: 이 이메일로 로그인한 경우에만 노출
const ADMIN_EMAIL = "eomhihi007@gmail.com";

/** 뉴스 섹션 갱신과 맞춤(1시간). 이전 604800이면 페이지·뉴스가 7일 동안 동일 */
export const revalidate = 3600;

export default async function LandingPage() {
  const [newsResult, session] = await Promise.all([getNews(), getServerSession(authOptions)]);
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen flex flex-col">
      <SejongHeader />
      <NewsTicker initialNews={newsResult.news} error={newsResult.error} />
      <main className="flex-1">
        <SejongHeroSection />
        <NewsSection initialNews={newsResult.news} error={newsResult.error} />
        <SejongFeatureCards />
        <AirBBotFeatureSection />
        <BenefitsSection />
        <CTASection />
      </main>
      <SejongFooter isAdmin={isAdmin} />
    </div>
  );
}
