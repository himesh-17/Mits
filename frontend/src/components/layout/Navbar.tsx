"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* LOGO (disappears on scroll) */}
      <div
        className={`fixed top-4 left-6 z-50 transition-all duration-1500 ${
          scrolled
            ? "opacity-0 -translate-y-4 pointer-events-none"
            : "opacity-100"
        }`}
      >
        <Image src="/mits.png" alt="MITS Logo" width={120} height={120} />
      </div>

      {/* RIGHT SIDE CIRCULAR NAVBAR */}
      <div className="fixed top-6 right-32 z-40 transition-all duration-300">
        <div
          className={`flex items-center gap-8 rounded-full px-10 py-3 text-white shadow-lg font-[var(--font-navbar)] transition-all duration-300 ${
            scrolled
              ? "bg-black/85 backdrop-blur-lg border border-white/20"
              : "bg-white/10 backdrop-blur-md border border-white/30"
          }`}
        >
          <a href="#home" className="hover:text-sky-400 transition">
            Main Website
          </a>

          <a href="#about" className="hover:text-sky-400 transition">
            About
          </a>

          <a href="#team" className="hover:text-sky-400 transition">
            Meet the Team
          </a>

          <a href="#contact" className="hover:text-sky-400 transition">
            Contact
          </a>

    
        </div>
      </div>
      {/* LOGIN BUTTON OUTSIDE NAVBAR */}
      <div className="fixed top-9 right-6 z-50">
        <Link
          href="/login"
          className="px-6 py-2 rounded-full bg-sky-500 text-white font-semibold hover:bg-sky-600 transition shadow-md"
        >
          Login
        </Link>
      </div>
    </>
  );
}
