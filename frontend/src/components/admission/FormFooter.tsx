"use client";

import { useState } from "react";
import { Save, ChevronRight, Info, ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useFormContext } from "react-hook-form";
import { useAdmissionForm } from "../../context/AdmissionContext";
import { PersonalFormData } from "../../lib/validationSchemas";

export default function FormFooter() {
    const router = useRouter();
    const { saveAsDraft } = useAdmissionForm();
    const { handleSubmit, formState: { isValid } } = useFormContext<PersonalFormData>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = (data: PersonalFormData) => {
        setIsSubmitting(true);
        // Simulate brief save (actual save to context happens via watch in parent)
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success("Personal details saved!");
            router.push('/admission/academic');
        }, 400);
    };

    const handleInvalid = () => {
        toast.error("Please fix the errors before continuing");
    };

    const handleSaveDraft = () => {
        saveAsDraft();
        toast.success("Form saved as draft successfully!");
    };

    return (
        <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                {/* Save as Draft */}
                <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="inline-flex items-center justify-center gap-2 px-4 h-11 md:h-10 text-sm font-semibold text-[#64748B] uppercase tracking-wide hover:text-[#0F172A] transition cursor-pointer active:scale-[0.97]"
                >
                    <Save className="w-4 h-4" />
                    Save as Draft
                </button>

                {/* Right side buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.push('/student-dashboard')}
                        className="px-5 h-11 md:h-10 rounded-md border border-[#0F172A] text-sm font-semibold text-[#0F172A] uppercase tracking-wide hover:bg-gray-50 transition cursor-pointer active:scale-[0.97]"
                    >
                        Previous
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit(onSubmit, handleInvalid)}
                        disabled={isSubmitting || !isValid}
                        className="inline-flex items-center justify-center gap-1 px-5 h-11 md:h-10 rounded-md bg-[#0EA5E9] text-sm font-semibold text-white uppercase tracking-wide hover:bg-[#0284C7] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.97]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                Save & Next
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Footer Notes */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-start gap-2 text-xs text-[#64748B] sm:max-w-[50%]">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#94A3B8]" />
                    <p>
                        You can return to this form anytime using your Application ID.
                    </p>
                </div>
                <div className="flex items-start gap-2 text-xs text-[#64748B] sm:max-w-[50%] sm:text-right">
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
