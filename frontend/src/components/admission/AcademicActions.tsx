"use client";

import { Save, ChevronRight, Info, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdmissionForm } from "../../context/AdmissionContext";

export default function AcademicActions() {
    const router = useRouter();
    const { formData, saveAsDraft } = useAdmissionForm();

    const handleNext = () => {
        // Validation check for Step 2
        const requiredFields = [
            formData.programApplied, formData.branch, formData.marks10th,
            formData.marks12th, formData.board10th, formData.year10th,
            formData.board12th, formData.year12th
        ];

        if (requiredFields.some(field => !field || field.trim() === "")) {
            alert("Please fill in all required academic fields marked with an asterisk (*).");
            return;
        }

        router.push('/admission/documents');
    };

    return (
        <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
                {/* Save as Draft */}
                <button
                    type="button"
                    onClick={saveAsDraft}
                    className="inline-flex items-center gap-2 px-4 h-10 text-sm font-semibold text-[#64748B] uppercase tracking-wide hover:text-[#0F172A] transition cursor-pointer"
                >
                    <Save className="w-4 h-4" />
                    Save as Draft
                </button>

                {/* Right side buttons */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.push('/admission')}
                        className="px-5 h-10 rounded-md border border-[#0F172A] text-sm font-semibold text-[#0F172A] uppercase tracking-wide hover:bg-gray-50 transition cursor-pointer"
                    >
                        Previous
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center gap-1 px-5 h-10 rounded-md bg-[#0EA5E9] text-sm font-semibold text-white uppercase tracking-wide hover:bg-[#0284C7] transition cursor-pointer"
                    >
                        Save & Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Footer Notes */}
            <div className="flex items-start justify-between pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-start gap-2 text-xs text-[#64748B] max-w-[50%]">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#94A3B8]" />
                    <p>
                        You can return to this form anytime using your Application ID. All information should be correct.
                    </p>
                </div>
                <div className="flex items-start gap-2 text-xs text-[#64748B] max-w-[50%] text-right">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#0EA5E9]" />
                    <p>
                        All information provided must match your official government IDs.
                        Discrepancies may lead to rejection of admission.
                    </p>
                </div>
            </div>
        </div>
    );
}
