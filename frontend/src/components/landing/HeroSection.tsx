"use client";

import Navbar from "../layout/Navbar";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      <Navbar />

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/mainhall.jpeg')" }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="w-full px-12 lg:px-24 xl:px-45 text-white">
          <h1 className="text-4xl md:text-6xl  font-bold leading-tight">
            Engineering Excellence <br />
            to Shape a Better Future
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-200 max-w-3xl">
            Experience quality technical education at MITS Gwalior with modern
            laboratories, expert faculty, and strong industry placements.
          </p>

          <p className="mt-4 text-sky-400 font-semibold text-lg">
            NAAC A++ Accredited | Deemed University
          </p>

          <button
            onClick={() => router.push('/admission')}
            className="mt-8 rounded-lg bg-sky-500 px-8 py-3 text-lg font-semibold hover:bg-sky-600 transition shadow-lg cursor-pointer"
          >
            Start Your Application
          </button>
        </div>
      </div>
    </section>
  );
}
