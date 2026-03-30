"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserRound, Menu, X } from "lucide-react";
import { useAdmissionForm } from "../../context/AdmissionContext";

export default function AdmissionNavbar() {
    const { googleUser } = useAdmissionForm();
    const [mobileNav, setMobileNav] = useState(false);
    const userName = googleUser?.name || "Student";

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                {/* Left: Logo + Brand */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center">
                        <Image
                            src="/mits.png"
                            alt="MITS Logo"
                            width={56}
                            height={56}
                            className="object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                    </div>
                    <span className="text-lg md:text-xl font-bold text-[#0EA5E9]">
                        Admission Portal
                    </span>
                </div>

                {/* Center: Nav Links (hidden on mobile) */}
                <div className="hidden md:flex items-center">
                    <Link href="/admission" className="px-4 py-5 text-sm font-semibold text-[#0EA5E9] border-b-2 border-[#0EA5E9]">
                        Admissions
                    </Link>
                    <Link href="/student-dashboard" className="px-4 py-5 text-sm font-semibold text-[#0F172A] hover:text-[#0EA5E9] transition">
                        Dashboard
                    </Link>
                    <a href="#" className="px-4 py-5 text-sm font-semibold text-[#0F172A] hover:text-[#0EA5E9] transition">
                        Help
                    </a>
                </div>

                {/* Right: App ID + User + Mobile Menu Toggle */}
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="text-right leading-tight hidden sm:block">
                        <p className="text-bas text-[#0F172A] font-base">{userName}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 overflow-hidden">
                        {googleUser?.picture ? (
                            <img src={googleUser.picture} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserRound className="w-6 h-6 mt-2" />
                        )}
                    </div>
                    <button
                        onClick={() => setMobileNav(!mobileNav)}
                        className="md:hidden p-1 text-[#0F172A] cursor-pointer"
                    >
                        {mobileNav ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {mobileNav && (
                <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-3 space-y-1">
                    <Link href="/admission" className="block px-3 py-2 text-sm font-semibold text-[#0EA5E9] bg-[#F0F9FF] rounded-md" onClick={() => setMobileNav(false)}>Admissions</Link>
                    <Link href="/student-dashboard" className="block px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] rounded-md" onClick={() => setMobileNav(false)}>Dashboard</Link>
                    <Link href="/admission/payment" className="block px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] rounded-md" onClick={() => setMobileNav(false)}>Fees</Link>
                    <a href="#" className="block px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] rounded-md">Help</a>
                </div>
            )}
        </nav>
    );
}
