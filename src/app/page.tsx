import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SejongHeroSection } from "@/components/landing/SejongHeroSection";
import { SejongFeatureCards } from "@/components/landing/SejongFeatureCards";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { CTASection } from "@/components/landing/CTASection";
import { SejongFooter } from "@/components/landing/SejongFooter";
import { NewsTicker } from "@/components/landing/NewsTicker";
import { LifelongEducationInsightsSection } from "@/components/landing/LifelongEducationInsightsSection";
import { getNews } from "@/lib/get-news";
import { TopLogoBar } from "@/components/layout/TopLogoBar";
import { isAdminEmail } from "@/lib/admin";

/** 뉴스는 서버에서 주 1회 갱신(revalidate=604800) */
export const revalidate = 604800;

export default async function LandingPage() {
  const [newsResult, session] = await Promise.all([getNews(), getServerSession(authOptions)]);
  const isAdmin = isAdminEmail(session?.user?.email);

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      <TopLogoBar />
      <NewsTicker initialNews={newsResult.news} error={newsResult.error} message={newsResult.message} />
      <main className="flex-1 mt-28 sm:mt-24 md:mt-0">
        <SejongHeroSection />
        <SejongFeatureCards />
        <BenefitsSection />
        <LifelongEducationInsightsSection />
        <CTASection />
      </main>
      <SejongFooter isAdmin={isAdmin} />
    </div>
  );
}