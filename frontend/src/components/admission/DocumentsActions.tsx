"use client";

import { useRouter } from "next/navigation";
import { useAdmissionForm } from "../../context/AdmissionContext";
import { Save } from "lucide-react";

export default function DocumentsActions() {
    const router = useRouter();
    const { formData, saveAsDraft } = useAdmissionForm();

    const handleNext = () => {
        const requiredDocs = ["identity", "10th", "12th", "domicile", "photo", "signature"];
        const uploadedIds = Object.keys(formData.docsUploaded || {});

        const missingDocs = requiredDocs.filter(id => !uploadedIds.includes(id));

        if (missingDocs.length > 0) {
            alert("Please upload all required documents marked with an asterisk (*).");
            return;
        }

        router.push('/admission/payment');
    };

    return (
        <div className="flex items-center justify-between pt-6 mt-8 border-t border-[#E5E7EB]">
            {/* Left side button */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={saveAsDraft}
                    className="inline-flex items-center gap-2 px-4 h-10 text-sm font-semibold text-[#64748B] uppercase tracking-wide hover:text-[#0F172A] transition cursor-pointer"
                >
                    <Save className="w-4 h-4" />
                    Save as Draft
                </button>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => router.push('/admission/academic')}
                    className="px-6 h-10 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-sm font-bold uppercase tracking-wide rounded-md transition-colors cursor-pointer"
                >
                    Previous
                </button>

                <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-6 h-10 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-bold rounded-md transition-colors cursor-pointer shadow-sm shadow-[#0EA5E9]/20"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload & Continue
                </button>
            </div>
        </div>
    );
}
