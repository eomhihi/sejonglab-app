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

/** 뉴스는 실시간 조회(배포 캐시로 인한 불일치 방지) */
export const revalidate = 0;

export default async function LandingPage() {
  const [newsResult, session] = await Promise.all([getNews(), getServerSession(authOptions)]);
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen flex flex-col">
      <SejongHeader />
      <NewsTicker initialNews={newsResult.news} error={newsResult.error} message={newsResult.message} />
      <main className="flex-1">
        <SejongHeroSection />
        <NewsSection initialNews={newsResult.news} error={newsResult.error} message={newsResult.message} />
        <SejongFeatureCards />
        <AirBBotFeatureSection />
        <BenefitsSection />
        <CTASection />
      </main>
      <SejongFooter isAdmin={isAdmin} />
    </div>
  );
}
