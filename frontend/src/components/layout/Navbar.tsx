"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
        className={`fixed top-4 left-6 z-50 transition-all duration-700 ${
          scrolled
            ? "opacity-0 -translate-y-4 pointer-events-none"
            : "opacity-100"
        }`}
      >
        <Image src="/mits.png" alt="MITS Logo" width={100} height={100} />
      </div>

      {/* DESKTOP CIRCULAR NAVBAR */}
      <div className="hidden md:block fixed top-6 right-32 z-40 transition-all duration-300">
        <div
          className={`flex items-center gap-8 rounded-full px-10 py-3 text-white shadow-lg font-[var(--font-navbar)] transition-all duration-300 ${
            scrolled
              ? "bg-black/85 backdrop-blur-lg border border-white/20"
              : "bg-white/10 backdrop-blur-md border border-white/30"
          }`}
        >
          <a
            href="https://web.mitsgwalior.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sky-400 transition"
          >
            Main Website
          </a>

          <Link href="/about" className="hover:text-sky-400 transition">
            About
          </Link>

          <a href="/meet-the-team" className="hover:text-sky-400 transition">
            Meet the Team
          </a>

          <a href="/contact" className="hover:text-sky-400 transition">
            Contact
          </a>
        </div>
      </div>

      {/* LOGIN BUTTON (desktop) */}
      <div className="hidden md:block fixed top-9 right-6 z-50">
        <Link
          href="/login"
          className="px-6 py-2 rounded-full bg-sky-500 text-white font-semibold hover:bg-sky-600 transition shadow-md"
        >
          Login
        </Link>
      </div>

      {/* MOBILE MENU BUTTON */}
      <button
        className="md:hidden fixed top-6 right-6 z-50 text-gray-400"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* MOBILE MENU */}
      {/* MOBILE MENU */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full h-screen bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center gap-8 text-white text-lg z-40
  transform transition-all duration-500 ease-in-out
  ${open ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}
  `}
      >
        <a
          href="https://web.mitsgwalior.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-sky-400 transition"
        >
          Main Website
        </a>

        <Link href="/about" className="hover:text-sky-400 transition">
          About
        </Link>

        <a href="/meet-the-team" className="hover:text-sky-400 transition">
          Meet the Team
        </a>

        <a href="/contact" className="hover:text-sky-400 transition">
          Contact
        </a>

        <Link
          href="/login"
          onClick={() => setOpen(false)}
          className="mt-4 px-8 py-3 rounded-full bg-sky-500 hover:bg-sky-600 transition"
        >
          Login
        </Link>
      </div>
    </>
  );
}
