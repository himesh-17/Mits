"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "../layout/Navbar";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen w-full overflow-hidden flex items-center"
    >
      <Navbar />

      {/* Background Image */}
      <Image
        src="/mainhall.jpeg"
        alt="MITS Main Hall"
        fill
        priority
        quality={85}
        className="object-cover object-[center_30%] md:object-center"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 w-full px-6 sm:px-8 md:px-12 lg:px-24 text-white">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          Engineering Excellence <br />
          to Shape a Better Future
        </h1>

        <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-200 max-w-xl">
          Experience quality technical education at MITS Gwalior with modern
          laboratories, expert faculty, and strong industry placements.
        </p>

        <p className="mt-3 text-sky-400 font-semibold text-sm sm:text-base">
          NAAC A++ Accredited | Deemed University
        </p>

        <Link
          href="/login"
          className="inline-block mt-6 rounded-lg bg-sky-500 px-6 py-3 text-sm sm:text-base md:text-lg font-semibold hover:bg-sky-600 transition shadow-lg"
        >
          Start Your Application
        </Link>
      </div>
    </section>
  );
}
