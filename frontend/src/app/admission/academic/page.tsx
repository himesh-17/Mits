"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserRound, Menu, X } from "lucide-react";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAdmissionForm } from "../../../context/AdmissionContext";
import { academicSchema, AcademicFormData } from "../../../lib/validationSchemas";

import AdmissionHeader from "../../../components/admission/AdmissionHeader";
import ProgressBar from "../../../components/admission/ProgressBar";
import StepTabs from "../../../components/admission/StepTabs";
import AcademicInformation from "../../../components/admission/AcademicInformation";
import AcademicActions from "../../../components/admission/AcademicActions";

export default function AcademicPage() {
    const [mobileNav, setMobileNav] = useState(false);
    const [userName, setUserName] = useState("Student");
    const { formData, updateFormData } = useAdmissionForm();

    const methods = useForm<AcademicFormData>({
        resolver: zodResolver(academicSchema),
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
            programApplied: formData.programApplied,
            branch: formData.branch,
            marks10th: formData.marks10th,
            marks12th: formData.marks12th,
            board10th: formData.board10th,
            board12th: formData.board12th,
            year10th: formData.year10th,
            year12th: formData.year12th,
            entranceExam: formData.entranceExam,
            entranceScore: formData.entranceScore,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    useEffect(() => {
        const subscription = methods.watch((value) => {
            updateFormData(value as Partial<AcademicFormData>);
        });
        return () => subscription.unsubscribe();
    }, [methods, updateFormData]);

    return (
        <FormProvider {...methods}>
            <div className="min-h-screen bg-[#F8FAFC]">
                {/* 1. NAVBAR */}
                <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center">
                                <Image src="/mits.png" alt="MITS Logo" width={56} height={56} className="object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            </div>
                            <span className="text-lg md:text-xl font-bold text-[#0EA5E9]">Admission Portal</span>
                        </div>

                        <div className="hidden md:flex items-center">
                            <Link href="/student-dashboard" className="px-4 py-5 text-sm font-semibold text-[#0F172A] hover:text-[#0EA5E9] transition">Dashboard</Link>
                            <Link href="/admission" className="px-4 py-5 text-sm font-semibold text-[#0EA5E9] border-b-2 border-[#0EA5E9]">Admissions</Link>
                            <Link href="/payments" className="px-4 py-5 text-sm font-semibold text-[#0F172A] hover:text-[#0EA5E9] transition">Fees</Link>
                            <a href="#" className="px-4 py-5 text-sm font-semibold text-[#0F172A] hover:text-[#0EA5E9] transition">Help</a>
                        </div>

                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="text-right leading-tight hidden sm:block">
                                <p className="text-xs font-semibold text-[#0EA5E9]">OS-2026-6842</p>
                                <p className="text-xs text-[#0F172A] font-medium">{userName}</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 overflow-hidden">
                                <UserRound className="w-6 h-6 mt-2" />
                            </div>
                            <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden p-1 text-[#0F172A] cursor-pointer">
                                {mobileNav ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

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
                    <div className="mb-2">
                        <AdmissionHeader step={2} title="Academic Information" percentText="25% Completed" />
                        <ProgressBar percent={25} />
                    </div>

                    <div className="mb-6">
                        <StepTabs activeStep={2} />
                    </div>

                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4 sm:p-6 md:p-8 pb-8 md:pb-10">
                        <div className="space-y-8 md:space-y-10">
                            <AcademicInformation />
                            <hr className="border-[#E5E7EB]" />
                            <AcademicActions />
                        </div>
                    </div>
                </main>
            </div>
        </FormProvider>
    );
}
