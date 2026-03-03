"use client";

import Navbar from "../layout/Navbar";

export default function HeroSection() {
  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      <Navbar />

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/heroimg.webp')" }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 l-110 flex h-full items-center">
        <div className="max-w-4xl px-12 text-white">
          <h1 className="text-4xl md:text-6xl  font-bold leading-tight">
            Engineering Excellence <br />
            to Shape a Better Future
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-200 max-w-2xl">
            Experience quality technical education at MITS Gwalior with modern
            laboratories, expert faculty, and strong industry placements.
          </p>

          <p className="mt-4 text-sky-400 font-semibold text-lg">
            NAAC A++ Accredited | Deemed University
          </p>

          <button className="mt-8 rounded-lg bg-sky-500 px-8 py-3 text-lg font-semibold hover:bg-sky-600 transition shadow-lg">
            Start Your Application
          </button>
        </div>
      </div>
    </section>
  );
}
