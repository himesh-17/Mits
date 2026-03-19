import React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useFormContext } from "react-hook-form";
import { useAdmissionForm } from "../../context/AdmissionContext";
import { PaymentFormData } from "../../lib/validationSchemas";

interface PaymentActionsProps {
    onSubmit: () => void;
    isSubmitting?: boolean;
}

export default function PaymentActions({ onSubmit, isSubmitting = false }: PaymentActionsProps) {
    const router = useRouter();
    const { formData } = useAdmissionForm();
    const { handleSubmit, formState: { isValid } } = useFormContext<PaymentFormData>();

    const isScreenshotUploaded = !!formData.docsUploaded?.["payment"];
    const canSubmit = isValid && isScreenshotUploaded;

    const onFormSubmit = (_data: PaymentFormData) => {
        if (!isScreenshotUploaded) {
            toast.error("Please upload a payment screenshot");
            return;
        }
        onSubmit();
    };

    const handleInvalid = () => {
        toast.error("Please fill in all payment details correctly");
    };

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-8 border-t border-[#E5E7EB]">
            {/* Left side button */}
            <button
                type="button"
                onClick={() => {
                    router.push('/admission/documents');
                }}
                className="px-6 h-11 md:h-10 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-sm font-bold uppercase tracking-wide rounded-md transition-colors cursor-pointer active:scale-[0.97]"
            >
                Previous
            </button>

            {/* Right side button */}
            <button
                type="button"
                onClick={handleSubmit(onFormSubmit, handleInvalid)}
                disabled={isSubmitting || !canSubmit}
                className="px-6 h-11 md:h-10 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-bold transition-colors cursor-pointer shadow-sm shadow-[#0EA5E9]/20 rounded-md disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.97] inline-flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    "Submit Payment"
                )}
            </button>
        </div>
    );
}
