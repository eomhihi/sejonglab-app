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

export const revalidate = 86400;

export default async function LandingPage() {
  const [news, session] = await Promise.all([getNews(), getServerSession(authOptions)]);
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen flex flex-col">
      <SejongHeader />
      <NewsTicker initialNews={news} />
      <main className="flex-1">
        <SejongHeroSection />
        <NewsSection initialNews={news} />
        <SejongFeatureCards />
        <AirBBotFeatureSection />
        <BenefitsSection />
        <CTASection />
      </main>
      <SejongFooter isAdmin={isAdmin} />
    </div>
  );
}
