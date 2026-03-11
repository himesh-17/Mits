import AboutHero from "../../components/About/AboutHero";
import MissionVision from "../../components/About/MissionVision";
import WhatWeDo from "../../components/About/WhatWeDo";
import WhyChooseUs from "../../components/About/WhyChooseUs";

export default function AboutPage() {
  return (
    <main className="bg-gray-50 pt-20">
      <AboutHero />
      <MissionVision />
      <WhatWeDo />
      <WhyChooseUs />
    </main>
  );
}
