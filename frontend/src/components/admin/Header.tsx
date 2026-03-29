"use client";
import Image from "next/image";
import { useState } from "react";
import { FiBell, FiMenu, FiSearch, FiX } from "react-icons/fi";

type HeaderProps = {
  sidebarOpen?: boolean;
  onMenuToggle?: () => void;
};

export default function Header({
  sidebarOpen = false,
  onMenuToggle,
}: HeaderProps) {
  const [userName] = useState(() => {
    if (typeof window === "undefined") {
      return "Super Admin";
    }

    try {
      const user = JSON.parse(localStorage.getItem("googleUserInfo") || "{}");
      return user?.name ? String(user.name) : "Super Admin";
    } catch {
      return "Super Admin";
    }
  });

  const initial = String(userName).trim().charAt(0).toUpperCase() || "S";

  return (
    <header className="h-20 md:h-24 bg-white px-3 sm:px-4 lg:px-7 flex items-center justify-between gap-2">
      <div className="flex h-12 items-center gap-2">
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={onMenuToggle}
          className="lg:hidden h-9 w-9 inline-flex items-center justify-center text-[#334155]"
        >
          {sidebarOpen ? <FiX className="text-[20px]" /> : <FiMenu className="text-[20px]" />}
        </button>

        <Image
          src="/mits.png"
          alt="MITS Logo"
          width={50}
          height={50}
          className="object-contain"
        />

        <span className="text-[18px] sm:text-[21px] md:text-[23px] leading-none font-semibold text-[#2DA8E1]">
          Admission Portal
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 text-[#94A3B8] min-w-0">
        <button
          type="button"
          aria-label="Search"
          className="h-8 w-8 inline-flex items-center justify-center shrink-0"
        >
          <FiSearch className="text-[18px]" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="h-8 w-8 inline-flex items-center justify-center shrink-0"
        >
          <FiBell className="text-[18px]" />
        </button>

        <div className="hidden sm:block h-10 w-px bg-[#D5D4D4]" />

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#F1F5F9] text-[#2563EB] text-sm font-semibold flex items-center justify-center shrink-0">
            {initial}
          </div>

          <div className="leading-tight min-w-0 hidden sm:block">
            <p className="text-[14px] font-semibold text-[#0F1724] truncate">{userName}</p>
            <p className="text-[12px] text-[#94A3B8] truncate">Admin Panel</p>
          </div>
        </div>
      </div>
    </header>
  );
}
