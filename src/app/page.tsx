import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProductPositioning } from "@/components/landing/ProductPositioning";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { FeatureDeepDives } from "@/components/landing/FeatureDeepDives";
import { InventoryInteractiveDemo } from "@/components/landing/InventoryInteractiveDemo";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { WhyStockSense } from "@/components/landing/WhyStockSense";
import { RoleBasedSection } from "@/components/landing/RoleBasedSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F2F2ED] text-[#464B71] flex flex-col justify-between selection:bg-[#73D0C3]/30 selection:text-[#464B71]">
      {/* 1. Sticky Navigation */}
      <LandingNavbar />

      <main className="flex-1 w-full">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Product Positioning / Credibility */}
        <ProductPositioning />

        {/* 4. Editorial Problem Section */}
        <ProblemSection />

        {/* 5. Interactive Product Showcase */}
        <ProductShowcase />

        {/* 6. Feature Deep Dives */}
        <FeatureDeepDives />

        {/* 7. Live Interactive Movement Simulator */}
        <InventoryInteractiveDemo />

        {/* 8. 5-Step Operational Flow */}
        <WorkflowSection />

        {/* 9. The Three Pillars of StockSense */}
        <WhyStockSense />

        {/* 10. Role-Based Access Governance */}
        <RoleBasedSection />

        {/* 11. Final Call-to-Action */}
        <FinalCTA />
      </main>

      {/* 12. Enterprise Footer */}
      <LandingFooter />
    </div>
  );
}
