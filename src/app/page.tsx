import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SejongHeroSection } from "@/components/landing/SejongHeroSection";
import { SejongFeatureCards } from "@/components/landing/SejongFeatureCards";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { SejongIndexSection } from "@/components/landing/SejongIndexSection";
import { CTASection } from "@/components/landing/CTASection";
import { SejongFooter } from "@/components/landing/SejongFooter";
import { SejongNewsChat } from "@/components/chat/SejongNewsChat";
import { LifelongEducationInsightsSection } from "@/components/landing/LifelongEducationInsightsSection";
import { ResearchPortfolioSection } from "@/components/landing/ResearchPortfolioSection";
import { TopLogoBar } from "@/components/layout/TopLogoBar";
import { isAdminEmail } from "@/lib/admin";

const SHOW_PANEL_INSIGHTS_SECTION = false;

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = isAdminEmail(session?.user?.email);

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden relative">
      <TopLogoBar />
      <main className="flex-1 mt-28 sm:mt-24">
        <SejongHeroSection />
        <SejongFeatureCards />
        <BenefitsSection />
        <SejongIndexSection />
        {SHOW_PANEL_INSIGHTS_SECTION && <LifelongEducationInsightsSection />}
        <ResearchPortfolioSection />
        <CTASection />
      </main>
      <SejongFooter isAdmin={isAdmin} />
      <SejongNewsChat />
    </div>
  );
}