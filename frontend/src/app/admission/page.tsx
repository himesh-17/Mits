"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserRound, Menu, X } from "lucide-react";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAdmissionForm } from "../../context/AdmissionContext";
import { personalSchema, PersonalFormData } from "../../lib/validationSchemas";

import AdmissionHeader from "../../components/admission/AdmissionHeader";
import ProgressBar from "../../components/admission/ProgressBar";
import StepTabs from "../../components/admission/StepTabs";
import IdentityInformation from "../../components/admission/IdentityInformation";
import ContactDetails from "../../components/admission/ContactDetails";
import HobbiesSection from "../../components/admission/HobbiesSection";
import AchievementsInput from "../../components/admission/AchievementsInput";
import FormFooter from "../../components/admission/FormFooter";

export default function AdmissionPage() {
    const [mobileNav, setMobileNav] = useState(false);
    const [userName, setUserName] = useState("Student");
    const { formData, updateFormData } = useAdmissionForm();

    const methods = useForm<PersonalFormData>({
        resolver: zodResolver(personalSchema),
        defaultValues: formData,
        mode: "onChange",
    });

    useEffect(() => {
        const saved = localStorage.getItem("googleUserInfo");
        if (saved) {
            try {
                const info = JSON.parse(saved);
                if (info.name) setUserName(info.name);
            } catch { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        methods.reset({
            fullName: formData.fullName,
            fatherName: formData.fatherName,
            dob: formData.dob,
            gender: formData.gender,
            email: formData.email,
            mobile: formData.mobile,
            fatherMobile: formData.fatherMobile,
            motherMobile: formData.motherMobile,
            address: formData.address,
            hobbies: formData.hobbies || [],
            achievements: formData.achievements,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    useEffect(() => {
        const subscription = methods.watch((value) => {
            updateFormData(value as Partial<PersonalFormData>);
        });
        return () => subscription.unsubscribe();
    }, [methods, updateFormData]);

    return (
        <FormProvider {...methods}>
            <div className="min-h-screen bg-[#F8FAFC]">
                {/* 1. NAVBAR */}
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
                            <Link href="/payments" className="px-4 py-5 text-sm font-semibold text-[#0F172A] hover:text-[#0EA5E9] transition">
                                Fees
                            </Link>
                            <a href="#" className="px-4 py-5 text-sm font-semibold text-[#0F172A] hover:text-[#0EA5E9] transition">
                                Help
                            </a>
                        </div>

                        {/* Right: App ID + User + Mobile Menu Toggle */}
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="text-right leading-tight hidden sm:block">
                                <p className="text-xs font-semibold text-[#0EA5E9]">
                                    OS-2026-6842
                                </p>
                                <p className="text-xs text-[#0F172A] font-medium">{userName}</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 overflow-hidden">
                                <UserRound className="w-6 h-6 mt-2" />
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
                            <Link href="/payments" className="block px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] rounded-md" onClick={() => setMobileNav(false)}>Fees</Link>
                            <a href="#" className="block px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] rounded-md">Help</a>
                        </div>
                    )}
                </nav>

                {/* MAIN CONTENT */}
                <main className="max-w-[900px] mx-auto py-6 md:py-8 px-4">
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
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4 sm:p-6 md:p-8 pb-8 md:pb-10">
                        <div className="space-y-8 md:space-y-10">
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
        </FormProvider>
    );
}
