"use client";

import { useState, useEffect, useRef } from "react";
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

import AdmissionNavbar from "../../../components/admission/AdmissionNavbar";

export default function AcademicPage() {
    const [mobileNav, setMobileNav] = useState(false);
    const { formData, updateFormData } = useAdmissionForm();

    const methods = useForm<AcademicFormData>({
        resolver: zodResolver(academicSchema) as any,
        defaultValues: formData as any,
        mode: "onChange",
    });

    // Guard: true while a programmatic reset() is in flight so the
    // watch callback doesn't echo changes back → infinite loop.
    const isSyncingFromContext = useRef(false);
    const lastContextSnapshot = useRef<string>("");

    useEffect(() => {
        const snapshot = JSON.stringify({
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
        if (snapshot === lastContextSnapshot.current) return;
        lastContextSnapshot.current = snapshot;

        isSyncingFromContext.current = true;
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
        } as any);
        // setTimeout(0) ensures the guard is cleared AFTER watch callbacks
        // that fire synchronously during reset() have all completed.
        const timer = setTimeout(() => { isSyncingFromContext.current = false; }, 0);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    useEffect(() => {
        const subscription = methods.watch((value) => {
            if (isSyncingFromContext.current) return;
            const incoming = JSON.stringify(value);
            if (incoming === lastContextSnapshot.current) return;
            updateFormData(value as Partial<AcademicFormData>);
        });
        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateFormData]);

    return (
        <FormProvider {...methods}>
            <div className="min-h-screen bg-[#F8FAFC]">
                <AdmissionNavbar />

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
