"use client";

import { useState } from "react";
import Image from "next/image";
import { UserRound, CheckCircle2 } from "lucide-react";

import AdmissionHeader from "../../../components/admission/AdmissionHeader";
import ProgressBar from "../../../components/admission/ProgressBar";
import StepTabs from "../../../components/admission/StepTabs";
import PaymentSubmission from "../../../components/admission/PaymentSubmission";
import PaymentActions from "../../../components/admission/PaymentActions";

export default function PaymentPage() {
    const [progress, setProgress] = useState(90);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = () => {
        // Required validation could go here

        // Complete the progress to 100%
        setProgress(100);

        // Simulate API call / show success state
        setTimeout(() => {
            setIsSubmitted(true);
        }, 600);
    };

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
                            className="px-4 py-5 text-sm font-semibold text-[#0F172A] hover:text-[#0EA5E9] transition"
                        >
                            Dashboard
                        </a>
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
                                GJ-2026-8842
                            </p>
                            <p className="text-xs text-[#0F172A] font-medium">Gune Jain</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 overflow-hidden">
                            <UserRound className="w-6 h-6 mt-2" />
                        </div>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="max-w-[900px] mx-auto py-8 px-4 relative">
                {/* Header & Progress */}
                <div className="mb-2 transition-all duration-500">
                    <AdmissionHeader step={4} title="Payment Submission" percentText={`${progress}% Completed`} />
                    <ProgressBar percent={progress} />
                </div>

                {/* Step Navigation */}
                <div className="mb-6">
                    <StepTabs activeStep={4} />
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-8 pb-10">
                    <PaymentSubmission />
                    <PaymentActions onSubmit={handleSubmit} />
                </div>

                {/* Success Modal Overlay */}
                {isSubmitted && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-2xl p-10 max-w-md w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                            <CheckCircle2 className="w-20 h-20 text-[#16A34A] mb-6" />
                            <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Payment Submitted!</h2>
                            <p className="text-[#64748B] mb-8">
                                Your admission form and payment details have been successfully submitted for verification.
                                We will notify you once verified.
                            </p>
                            <button
                                onClick={() => window.location.href = '/admission'}
                                className="w-full h-12 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-lg transition-colors cursor-pointer"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
