"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

import HeroSection from "../components/landing/HeroSection";

const WhyChoose = dynamic(() => import("../components/landing/WhyChoose"), {
  loading: () => <p>Loading...</p>,
});
const StatsSection = dynamic(
  () => import("../components/landing/StatsSection"),
  { loading: () => <p>Loading...</p> },
);
const ProgramsSection = dynamic(
  () => import("../components/landing/ProgramsSection"),
  { loading: () => <p>Loading...</p> },
);
const ReasonsSection = dynamic(
  () => import("../components/landing/ReasonsSection"),
  { loading: () => <p>Loading...</p> },
);
const Footer = dynamic(() => import("../components/layout/Footer"), {
  loading: () => <p>Loading...</p>,
});

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
