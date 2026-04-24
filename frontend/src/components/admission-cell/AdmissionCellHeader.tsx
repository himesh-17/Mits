"use client";

import Image from "next/image";
import { FiBell, FiMenu, FiSearch } from "react-icons/fi";

interface AdmissionCellHeaderProps {
  onMenuToggle: () => void;
}

export default function AdmissionCellHeader({
  onMenuToggle,
}: AdmissionCellHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-[#D5D4D4] bg-white px-3 py-2.5 sm:px-4">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onMenuToggle}
          className="rounded-md p-1.5 transition-colors hover:bg-gray-100 lg:hidden"
          aria-label="Toggle menu"
        >
          <FiMenu className="h-5 w-5 text-[#475569]" />
        </button>

        <div className="flex items-center gap-2.5">
          <Image
            src="/mits.png"
            alt="MITS logo"
            width={64}
            height={64}
            className="h-12 w-12"
            priority
          />
          <span
            className="hidden text-[40px] font-bold leading-none text-[#2DA8E1] sm:inline"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Admission Portal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          className="rounded-md p-2 text-[#9CA3AF] transition-colors hover:bg-gray-100"
          aria-label="Search"
        >
          <FiSearch className="h-5 w-5" />
        </button>

        <button
          className="rounded-md p-2 text-[#9CA3AF] transition-colors hover:bg-gray-100"
          aria-label="Notifications"
        >
          <FiBell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-l border-[#D5D4D4] pl-3 sm:pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F5F9] text-[13px] font-semibold text-[#2563EB]">
            A
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-[14px] font-semibold leading-5 text-[#0F1724]">
              Admission Officer
            </p>
            <p className="text-[12px] leading-4 text-[#94A3B8]">Admission Cell</p>
          </div>
        </div>
      </div>
    </header>
  );
}
