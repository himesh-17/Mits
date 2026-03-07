"use client";

import Image from "next/image";
import { UserRound } from "lucide-react";

import AdmissionHeader from "../../components/admission/AdmissionHeader";
import ProgressBar from "../../components/admission/ProgressBar";
import StepTabs from "../../components/admission/StepTabs";
import IdentityInformation from "../../components/admission/IdentityInformation";
import ContactDetails from "../../components/admission/ContactDetails";
import HobbiesSection from "../../components/admission/HobbiesSection";
import AchievementsInput from "../../components/admission/AchievementsInput";
import FormFooter from "../../components/admission/FormFooter";

export default function AdmissionPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* 1. NAVBAR */}
            <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
                <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Left: Logo + Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 flex items-center justify-center">
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
                        <span className="text-xl font-bold text-[#0EA5E9]">
                            Admission Portal
                        </span>
                    </div>

                    {/* Center: Nav Links */}
                    <div className="flex items-center">
                        <a
                            href="#"
                            className="px-4 py-5 text-sm font-semibold text-[#0EA5E9] border-b-2 border-[#0EA5E9]"
                        >
                            Admissions
                        </a>
                        <a
                            href="#"
                            className="px-4 py-5 text-sm font-semibold text-[#0F172A] hover:text-[#0EA5E9] transition"
                        >
                            Dashboard
                        </a>
                        <a
                            href="#"
                            className="px-4 py-5 text-sm font-semibold text-[#0F172A] hover:text-[#0EA5E9] transition"
                        >
                            Fees
                        </a>
                        <a
                            href="#"
                            className="px-4 py-5 text-sm font-semibold text-[#0F172A] hover:text-[#0EA5E9] transition"
                        >
                            Help
                        </a>
                    </div>

                    {/* Right: App ID + User */}
                    <div className="flex items-center gap-4">
                        <div className="text-right leading-tight">
                            <p className="text-xs font-semibold text-[#0EA5E9]">
                                OS-2026-6842
                            </p>
                            <p className="text-xs text-[#0F172A] font-medium">Ojaswi Sharma</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 overflow-hidden">
                            <UserRound className="w-6 h-6 mt-2" />
                        </div>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="max-w-[900px] mx-auto py-8 px-4">
                {/* Header & Progress */}
                <div className="mb-2">
                    <AdmissionHeader step={1} title="Personal Details" percentText="0% Completed" />
                    <ProgressBar percent={0} />
                </div>

                {/* Step Navigation */}
                <div className="mb-6">
                    <StepTabs />
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-8 pb-10">
                    <div className="space-y-10">
                        <IdentityInformation />

                        <hr className="border-[#E5E7EB]" />

                        <ContactDetails />

                        <hr className="border-[#E5E7EB]" />

                        <HobbiesSection />
                        <AchievementsInput />

                        <hr className="border-[#E5E7EB]" />

                        <FormFooter />
                    </div>
                </div>
            </main>
        </div>
    );
}
