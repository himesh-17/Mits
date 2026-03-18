"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import AboutHero from "../../components/About/AboutHero";
import MissionVision from "../../components/About/MissionVision";
import WhatWeDo from "../../components/About/WhatWeDo";
import WhyChooseUs from "../../components/About/WhyChooseUs";

export default function AboutPage() {
  const router = useRouter();

  return (
    <main className="bg-gray-50 pt-20">
      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 bg-white/80 backdrop-blur border border-gray-200 px-4 py-2 rounded-full shadow-md hover:bg-sky-600 hover:text-white transition"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <AboutHero />
      <MissionVision />
      <WhatWeDo />
      <WhyChooseUs />
    </main>
  );
}
