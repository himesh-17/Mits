"use client";

import { UserRound } from "lucide-react";

export default function IdentityInformation() {
    return (
        <div className="space-y-5">
            {/* Section Title */}
            <div className="flex items-center gap-2">
                <UserRound className="w-5 h-5 text-[#0F172A]" />
                <h2 className="text-base font-bold text-[#0F172A]">
                    Identity Information
                </h2>
            </div>

            {/* Row 1: Full Name + Date of Birth */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Full Name (as per ID) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Ojaswi Sharma"
                        className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        placeholder="mm/dd/yyyy"
                        className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] text-sm text-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
                    />
                </div>
            </div>

            {/* Row 2: Father's Full Name + Gender */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Father&apos;s Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Guardian Name"
                        className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        Gender <span className="text-red-500">*</span>
                    </label>
                    <select className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] text-sm text-[#94A3B8] bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] appearance-none">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
