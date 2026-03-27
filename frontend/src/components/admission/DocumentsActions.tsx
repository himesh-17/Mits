"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAdmissionForm } from "../../context/AdmissionContext";
import { validateDocuments } from "../../lib/validationSchemas";
import { api } from "../../utils/api";

const requiredDocTypes = [
    "aadhar",
    "marksheet_10",
    "marksheet_12",
    "domaicile",
    "photo",
    "signature",
];

export default function DocumentsActions() {
    const router = useRouter();
    const {
        formData,
        saveAsDraft,
        updateFormData,
        submitApplication,
        setValidationErrors,
        clearValidationErrors,
        selectedFiles,
    } = useAdmissionForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isValid =
        Object.keys(validateDocuments(formData.docsUploaded || {})).length === 0;

    const handleNext = async () => {
        // Step 1: Re-validate required docs are present locally
        const docErrors = validateDocuments(formData.docsUploaded || {});
        if (Object.keys(docErrors).length > 0) {
            setValidationErrors(docErrors);
            toast.error("Please upload all required documents before continuing.");
            return;
        }
        clearValidationErrors();

        setIsSubmitting(true);
        try {
            await submitApplication();

            const selectedEntries = Object.entries(selectedFiles || {});
            for (const [docType, file] of selectedEntries) {
                const form = new FormData();
                form.append("file", file);

                const uploadRes = await api.post("/api/student/documents/upload", form, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                const uploaded = uploadRes?.data?.data;
                await api.post("/api/student/documents", {
                    docType,
                    fileUrl: uploaded?.fileUrl,
                    fileName: uploaded?.fileName || file.name,
                    mimeType: uploaded?.mimeType || file.type,
                });
            }

            const docsRes = await api.get("/api/student/documents");
            const existingDocs = Array.isArray(docsRes?.data?.data?.documents)
                ? docsRes.data.data.documents
                : [];

            const existingDocTypes = new Set(
                existingDocs
                    .map((doc: { docType?: string }) => doc?.docType)
                    .filter(Boolean)
            );

            const missingRequired = requiredDocTypes.filter((docType) => !existingDocTypes.has(docType));
            if (missingRequired.length > 0) {
                toast.error("Please upload all required documents before continuing.");
                return;
            }

            updateFormData({ highestStep: Math.max(formData.highestStep, 4) });
            toast.success("Documents saved! Proceeding to payment.");
            router.push("/admission/payment");
        } catch (error: unknown) {
            const axiosErr = error as {
                response?: { data?: { message?: string }; status?: number };
                message?: string;
            };
            const backendMsg = axiosErr?.response?.data?.message;
            const httpStatus = axiosErr?.response?.status;

            if (backendMsg) {
                toast.error(backendMsg);
            } else if (httpStatus === 500) {
                toast.error("Server error — please try again or contact support.");
            } else {
                toast.error(axiosErr?.message || "Failed to save documents. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraft = () => {
        saveAsDraft();
        toast.success("Form saved as draft successfully!");
    };

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 mt-8 border-t border-[#E5E7EB]">
            {/* Left side button */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="inline-flex items-center justify-center gap-2 px-4 h-11 md:h-10 text-sm font-semibold text-[#64748B] uppercase tracking-wide hover:text-[#0F172A] transition cursor-pointer active:scale-[0.97]"
                >
                    <Save className="w-4 h-4" />
                    Save as Draft
                </button>
            </div>

            {/* Right side buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                    type="button"
                    onClick={() => {
                        clearValidationErrors();
                        router.push("/admission/academic");
                    }}
                    className="px-6 h-11 md:h-10 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-sm font-bold uppercase tracking-wide rounded-md transition-colors cursor-pointer active:scale-[0.97]"
                >
                    Previous
                </button>

                <button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting || !isValid}
                    className="inline-flex items-center justify-center gap-2 px-6 h-11 md:h-10 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-bold rounded-md transition-colors cursor-pointer shadow-sm shadow-[#0EA5E9]/20 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.97]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                            </svg>
                            Upload &amp; Continue
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
