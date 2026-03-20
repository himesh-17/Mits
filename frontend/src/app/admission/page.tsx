"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserRound, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAdmissionForm } from "../../context/AdmissionContext";
import { personalSchema, PersonalFormData } from "../../lib/validationSchemas";
import { api } from "../../utils/api";

import AdmissionHeader from "../../components/admission/AdmissionHeader";
import ProgressBar from "../../components/admission/ProgressBar";
import StepTabs from "../../components/admission/StepTabs";
import IdentityInformation from "../../components/admission/IdentityInformation";
import ContactDetails from "../../components/admission/ContactDetails";
import HobbiesSection from "../../components/admission/HobbiesSection";
import AchievementsInput from "../../components/admission/AchievementsInput";
import FormFooter from "../../components/admission/FormFooter";

import AdmissionNavbar from "../../components/admission/AdmissionNavbar";

export default function AdmissionPage() {
    const { formData, updateFormData } = useAdmissionForm();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    // Auth guard — redirect to login if session is invalid
    useEffect(() => {
        async function validateSession() {
            try {
                await api.get("/api/auth/me");
                setIsAuthorized(true);
            } catch {
                router.replace("/login");
            } finally {
                setIsChecking(false);
            }
        }
        validateSession();
    }, [router]);

    // Guard ref: true while a programmatic reset() is in flight so the
    // watch callback doesn't echo changes back into the context → infinite loop.
    const isSyncingFromContext = useRef(false);

    const methods = useForm<PersonalFormData>({
        resolver: zodResolver(personalSchema),
        defaultValues: formData,
        mode: "onChange",
    });

    // Stable snapshot of the last context data pushed into the form.
    // Used to skip watch callbacks that echo back what context just set.
    const lastContextSnapshot = useRef<string>("");

    useEffect(() => {
        const snapshot = JSON.stringify({
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
        // Don't reset if nothing changed — prevents spurious re-renders
        if (snapshot === lastContextSnapshot.current) return;
        lastContextSnapshot.current = snapshot;

        isSyncingFromContext.current = true;
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
        // Use setTimeout(0) instead of queueMicrotask — watch callbacks from reset()
        // fire synchronously within the same microtask, so queueMicrotask clears
        // the guard too early. setTimeout(0) runs after the full call stack settles.
        const timer = setTimeout(() => { isSyncingFromContext.current = false; }, 0);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    useEffect(() => {
        const subscription = methods.watch((value) => {
            if (isSyncingFromContext.current) return;   // ignore programmatic resets
            // Extra guard: skip if the value matches what context already has
            const incoming = JSON.stringify(value);
            if (incoming === lastContextSnapshot.current) return;
            updateFormData(value as Partial<PersonalFormData>);
        });
        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateFormData]);

    if (isChecking || !isAuthorized) return null;

    return (
        <FormProvider {...methods}>
            <div className="min-h-screen bg-[#F8FAFC]">
                <AdmissionNavbar />

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
