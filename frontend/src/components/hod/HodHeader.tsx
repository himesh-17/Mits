"use client";

import Image from "next/image";
import { useState } from "react";
import { FiBell, FiMenu, FiSearch, FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface HodHeaderProps {
  onMenuToggle: () => void;
}

export default function HodHeader({ onMenuToggle }: HodHeaderProps) {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const userInfo = (() => {
    try {
      const storedUser = typeof window !== "undefined" ? localStorage.getItem("googleUserInfo") : null;
      return storedUser ? JSON.parse(storedUser) as { name?: string; email?: string } : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("googleUserInfo");
    localStorage.removeItem("admissionFormDraft");
    localStorage.removeItem("user");
    router.push("/login");
  };

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
          <Image src="/mits.png" alt="MITS logo" width={64} height={64} className="h-12 w-12" priority />
          <span className="hidden text-[40px] font-bold leading-none text-[#2DA8E1] sm:inline" style={{ fontFamily: "var(--font-poppins)" }}>
            Admission Portal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Search */}
        {showSearch && (
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students..."
            className="w-48 rounded-md border border-[#D5D4D4] px-3 py-1.5 text-sm text-[#0F1724] outline-none focus:border-[#2DA8E1] transition-colors"
            autoFocus
            onBlur={() => {
              if (!searchQuery) setShowSearch(false);
            }}
          />
        )}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="rounded-md p-2 text-[#9CA3AF] transition-colors hover:bg-gray-100"
          aria-label="Search"
        >
          <FiSearch className="h-5 w-5" />
        </button>

        <button className="relative rounded-md p-2 text-[#9CA3AF] transition-colors hover:bg-gray-100" aria-label="Notifications">
          <FiBell className="h-5 w-5" />
        </button>

        {/* Profile Section */}
        <div className="relative flex items-center gap-3 border-l border-[#D5D4D4] pl-3 sm:pl-4">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-gray-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F5F9] text-[13px] font-semibold text-[#2563EB]">
              {userInfo?.name?.charAt(0)?.toUpperCase() || "H"}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-[14px] font-semibold leading-5 text-[#0F1724]">{userInfo?.name || "Head Of Department"}</p>
              <p className="text-[12px] leading-4 text-[#94A3B8]">HOD Panel</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-12 z-50 w-48 rounded-md border border-[#E2E8F0] bg-white py-2 shadow-lg">
              <div className="border-b border-[#E2E8F0] px-4 py-2">
                <p className="text-xs font-medium text-[#0F1723]">{userInfo?.email || "hod@mitsgwl.ac.in"}</p>
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
