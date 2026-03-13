"use client";

import Image from "next/image";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#171A7C] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-4 gap-8">
        {/* Logo + Description */}
        <div>
          <Image
            src="/mits.png"
            alt="MITS Logo"
            width={60}
            height={60}
            className="mb-3"
          />

          <p className="text-sm text-gray-200 leading-relaxed">
            Established in 1957, MITS Gwalior is a NAAC A++ accredited deemed
            university known for academic excellence and strong placement
            records.
          </p>

          {/* Social Icons */}
          <div className="flex gap-3 mt-4">
            <div className="bg-blue-600 p-2 rounded-full hover:scale-110 transition cursor-pointer">
              <Facebook size={16} />
            </div>

            <div className="bg-sky-500 p-2 rounded-full hover:scale-110 transition cursor-pointer">
              <Twitter size={16} />
            </div>

            <div className="bg-blue-700 p-2 rounded-full hover:scale-110 transition cursor-pointer">
              <Linkedin size={16} />
            </div>

            <div className="bg-pink-500 p-2 rounded-full hover:scale-110 transition cursor-pointer">
              <Instagram size={16} />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-3 text-sm">Quick Links</h3>

          <ul className="space-y-1 text-sm text-gray-200">
            <li className="hover:text-white cursor-pointer">Home</li>
            <li className="hover:text-white cursor-pointer">About</li>
            <li className="hover:text-white cursor-pointer">Privacy</li>
            <li className="hover:text-white cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* Portal */}
        <div>
          <h3 className="font-semibold mb-3 text-sm">Portal</h3>

          <ul className="space-y-1 text-sm text-gray-200">
            <li className="hover:text-white cursor-pointer">Student Login</li>
            <li className="hover:text-white cursor-pointer">Apply Now</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-3 text-sm">Contact</h3>

          <div className="space-y-2 text-sm text-gray-200">
            <div className="flex gap-2 items-start">
              <MapPin size={14} />
              <p>MITS Gwalior, Gola Ka Mandir, Gwalior – 474005</p>
            </div>

            <div className="flex gap-2 items-center">
              <Phone size={14} />
              <p>+91-751-2409300</p>
            </div>

            <div className="flex gap-2 items-center">
              <Mail size={14} />
              <p>vicechancellor@mitsgwalior.in</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-red-600 text-white text-xs">
        <div className="max-w-7xl mx-auto px-6 py-2 flex flex-col md:flex-row justify-between items-center gap-1">
          <p className="hover:underline cursor-pointer">
            Disclaimer / Privacy Policy
          </p>

          <p>© 2026 MITS GWALIOR</p>

          <p>Designed & Developed by SDC</p>
        </div>
      </div>
    </footer>
  );
}
