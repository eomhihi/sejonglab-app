import { SejongHeader } from "@/components/landing/SejongHeader";
import { SejongHeroSection } from "@/components/landing/SejongHeroSection";
import { SejongFeatureCards } from "@/components/landing/SejongFeatureCards";
import { AirBBotFeatureSection } from "@/components/landing/AirBBotFeatureSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { CTASection } from "@/components/landing/CTASection";
import { SejongFooter } from "@/components/landing/SejongFooter";
import { NewsTicker, NewsSection } from "@/components/landing/NewsTicker";
import { getNews } from "@/lib/get-news";

export const revalidate = 86400;

export default async function LandingPage() {
  const news = await getNews();

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
      <SejongFooter />
    </div>
  );
}
