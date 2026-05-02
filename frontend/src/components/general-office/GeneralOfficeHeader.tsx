"use client";

import Image from "next/image";
import { FiMenu, FiSearch, FiBell, FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface GeneralOfficeHeaderProps {
  onMenuToggle: () => void;
}

export default function GeneralOfficeHeader({
  onMenuToggle,
}: GeneralOfficeHeaderProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const userInfo = useState<{ name?: string; email?: string } | null>(() => {
    try {
      const storedUser = localStorage.getItem("googleUserInfo");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing user info:", error);
      return null;
    }
  })[0];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("googleUserInfo");
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-[#D5D4D4] bg-white px-4 py-3 sm:px-5">
      {/* Left Section: Menu Button and Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <FiMenu className="w-5 h-5 text-[#475569]" />
        </button>

        <div className="flex items-center gap-3">
          <Image
            src="/mits.png"
            alt="MITS logo"
            width={72}
            height={72}
            className="h-10 w-10 sm:h-12 sm:w-12"
            priority
          />
          <span
            className="hidden text-[34px] font-bold leading-none text-[#2DA8E1] sm:inline"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Admission Portal
          </span>
        </div>
      </div>

      {/* Right Section: Search, Notifications, Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Bar - Hidden on mobile */}
        <div className="hidden items-center gap-2 rounded-lg bg-[#F5F7FA] px-3 py-2 md:flex">
          <FiSearch className="w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search applications..."
            className="bg-transparent text-sm outline-none w-52 placeholder-[#9CA3AF]"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 transition-colors hover:bg-gray-100"
          aria-label="Notifications"
        >
          <FiBell className="w-5 h-5 text-[#475569]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full" />
        </button>

        {/* Profile Section */}
        <div className="flex items-center gap-3 border-l border-[#D5D4D4] pl-3 sm:pl-4">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-lg px-1 py-1 transition-colors hover:bg-gray-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F5F9] text-[13px] font-semibold text-[#2563EB]">
              {userInfo?.name?.charAt(0)?.toUpperCase() || "G"}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-[14px] font-semibold leading-5 text-[#0F1724]">
                General Office
              </p>
              <p className="text-[12px] leading-4 text-[#94A3B8]">General Office</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-4 top-16 z-50 w-48 rounded-lg border border-[#E2E8F0] bg-white py-2 shadow-lg">
              <div className="border-b border-[#E2E8F0] px-4 py-2">
                <p className="text-xs font-medium text-[#0F1723]">{userInfo?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <FiLogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
