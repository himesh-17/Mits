"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserRound, CheckCircle2, Menu, X } from "lucide-react";
import toast from "react-hot-toast";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, PaymentFormData } from "../../../lib/validationSchemas";

import AdmissionHeader from "../../../components/admission/AdmissionHeader";
import ProgressBar from "../../../components/admission/ProgressBar";
import StepTabs from "../../../components/admission/StepTabs";
import PaymentSubmission from "../../../components/admission/PaymentSubmission";
import PaymentActions from "../../../components/admission/PaymentActions";
import { useAdmissionForm } from "../../../context/AdmissionContext";

export default function PaymentPage() {
    const { formData, updateFormData } = useAdmissionForm();
    const [progress, setProgress] = useState(75);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [mobileNav, setMobileNav] = useState(false);
    const [userName, setUserName] = useState("Student");

    const methods = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            upiId: formData.upiId,
            transactionId: formData.transactionId,
        },
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
            upiId: formData.upiId,
            transactionId: formData.transactionId,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    useEffect(() => {
        const subscription = methods.watch((value) => {
            updateFormData(value as Partial<PaymentFormData>);
        });
        return () => subscription.unsubscribe();
    }, [methods, updateFormData]);

    const handleSubmit = () => {
        setProgress(100);
        toast.success("Payment submitted successfully!");

        setTimeout(() => {
            setIsSubmitted(true);
        }, 600);
    };

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
                <main className="max-w-[900px] mx-auto py-6 md:py-8 px-4 relative">
                    <div className="mb-2 transition-all duration-500">
                        <AdmissionHeader step={4} title="Payment Submission" percentText={`${progress}% Completed`} />
                        <ProgressBar percent={progress} />
                    </div>

                    <div className="mb-6">
                        <StepTabs activeStep={4} />
                    </div>

                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4 sm:p-6 md:p-8 pb-8 md:pb-10">
                        <div className="space-y-8">
                            <PaymentSubmission />
                            <PaymentActions onSubmit={handleSubmit} />
                        </div>
                    </div>

                    {/* Success Modal Overlay */}
                    {isSubmitted && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="bg-white rounded-2xl p-8 sm:p-10 max-w-md w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                                <CheckCircle2 className="w-16 sm:w-20 h-16 sm:h-20 text-[#16A34A] mb-6" />
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-4">Payment Submitted!</h2>
                                <p className="text-[#64748B] mb-8 text-sm sm:text-base">
                                    Your admission form and payment details have been successfully submitted for verification.
                                    We will notify you once verified.
                                </p>
                                <button
                                    onClick={() => window.location.href = '/student-dashboard'}
                                    className="w-full h-12 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-lg transition-colors cursor-pointer active:scale-[0.98]"
                                >
                                    Return to Dashboard
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </FormProvider>
    );
}
