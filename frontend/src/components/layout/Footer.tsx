import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="font-montserrat">
      {/* Main Footer */}
      <div className="bg-[#0d0d66] text-white">
        <div className="w-full px-12 lg:px-24 py-8 grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr_1.2fr] gap-10">
          {/* Left Section */}
          <div>
            <Image
              src="/mits.png"
              alt="MITS Logo"
              width={90}
              height={90}
              className="mb-3"
            />
            <p className="text-sm leading-6 text-gray-300">
              Established in 1957, MITS Gwalior is a NAAC A++ accredited deemed
              university known for academic excellence, innovation, and strong
              placement records across engineering and management disciplines.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3 justify-center md:justify-start">
            <div className="flex gap-3 mt-5 justify-center">
              <a
                href="https://www.facebook.com/share/1NScjkyV8m/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 p-2 rounded-full hover:scale-110 transition cursor-pointer text-white"
              >
                <Facebook size={16} />
              </a>

              <a
                href="https://x.com/mitsgwl"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-sky-500 p-2 rounded-full hover:scale-110 transition cursor-pointer text-white"
              >
                <Twitter size={16} />
              </a>

              <a
                href="https://www.linkedin.com/school/mitsdugwalior/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-700 p-2 rounded-full hover:scale-110 transition cursor-pointer text-white"
              >
                <Linkedin size={16} />
              </a>

              <a
                href="https://www.instagram.com/mits_gwalior?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pink-500 p-2 rounded-full hover:scale-110 transition cursor-pointer text-white"
              >
                <Instagram size={16} />
              </a>
            </div></div>
          </div>

          {/* Quick Links */}
          <div className="mt-15 md:mt-0">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text- text-gray-300">
              <li className="hover:text-white transition cursor-pointer">
                Home
              </li>
              <li className="hover:text-white transition cursor-pointer">
                About
              </li>
              <li className="hover:text-white transition cursor-pointer">
                Privacy
              </li>
              <li className="hover:text-white transition cursor-pointer">
                Contact
              </li>
            </ul>
          </div>

          {/* Portal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Portal</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="hover:text-white transition cursor-pointer">
                Student Login
              </li>
              <li className="hover:text-white transition cursor-pointer">
                Apply Now
              </li>
              
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-semibold mb-3">Contact</h3>

            <div className="flex items-start gap-2 text-xs text-gray-300 leading-5">
              <MapPin size={16} className="mt-1" />
              <p>
                Madhav Institute of Technology and Science, Gola Ka Mandir,
                Gwalior – 474005, Madhya Pradesh, India
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-300 mt-3">
              <Phone size={16} />
              <span>+91-751-2409300 | +91-751-2409354</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-300 mt-3">
              <Mail size={16} />
              <span>vicechancellor@mitsgwalior.in</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Red Bar */}
      <div className="bg-red-600 text-white text-sm">
        <div className="w-full px-12 lg:px-24 py-3 flex flex-col md:flex-row justify-between items-center gap-2">
          <span>Disclaimer/Privacy Policy</span>
          <span>© 2026 MITS GWALIOR. All Rights Reserved</span>
          <span>Designed & Developed by MITS bkc</span>
        </div>
      </div>
    </footer>
  );
}
