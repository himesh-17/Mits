import HeroSection from "../components/landing/HeroSection";
import WhyChoose from "../components/landing/WhyChoose";
import StatsSection from "../components/landing/StatsSection";
import ProgramsSection from "../components/landing/ProgramsSection";
import ReasonsSection from "../components/landing/ReasonsSection";
import Footer from "../components/layout/Footer";
export default function Home() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <WhyChoose />
      <ReasonsSection />
      <StatsSection />

      <ProgramsSection />
      <Footer />
    </main>
  );
}
