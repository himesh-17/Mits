"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserRound, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdmissionForm } from "../../../context/AdmissionContext";

import AdmissionHeader from "../../../components/admission/AdmissionHeader";
import ProgressBar from "../../../components/admission/ProgressBar";
import StepTabs from "../../../components/admission/StepTabs";
import DocumentsUploadForm from "../../../components/admission/DocumentsUploadForm";
import DocumentsActions from "../../../components/admission/DocumentsActions";

import AdmissionNavbar from "../../../components/admission/AdmissionNavbar";

export default function DocumentsPage() {
    const { formData } = useAdmissionForm();
    const router = useRouter();

    useEffect(() => {
        if (formData.highestStep < 3) {
            router.replace(formData.highestStep === 2 ? '/admission/academic' : '/admission');
        }
    }, [formData.highestStep, router]);

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <AdmissionNavbar />

            {/* MAIN CONTENT */}
            <main className="max-w-[900px] mx-auto py-6 md:py-8 px-4">
                <div className="mb-2">
                    <AdmissionHeader step={3} title="Documents" percentText="50% Completed" />
                    <ProgressBar percent={50} />
                </div>

                <div className="mb-6">
                    <StepTabs activeStep={3} />
                </div>

                <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4 sm:p-6 md:p-8 pb-8 md:pb-10">
                    <div className="space-y-6">
                        <DocumentsUploadForm />
                        <DocumentsActions />
                    </div>
                </div>
            </main>
        </div>
    );
}
