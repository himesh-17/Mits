import React, { useState } from "react";
import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useAdmissionForm } from "../../context/AdmissionContext";
import { PaymentFormData, validateFile } from "../../lib/validationSchemas";

export default function PaymentSubmission() {
    const { register, formState: { errors } } = useFormContext<PaymentFormData>();
    const { formData, updateFormData, validationErrors } = useAdmissionForm();
    const screenshotName = formData.docsUploaded?.["payment"]?.name;
    const [fileError, setFileError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const error = validateFile(file);
        if (error) {
            setFileError(error);
            e.target.value = "";
            return;
        }

        setFileError(null);

        // Generate preview
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPreviewUrl(ev.target?.result as string);
        };
        reader.readAsDataURL(file);

        const newDocs = {
            ...formData.docsUploaded,
            payment: { name: file.name, size: file.size, type: file.type }
        };
        updateFormData({ docsUploaded: newDocs });
    };

    const screenshotError = fileError || validationErrors?.["payment"];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-[#0F172A]" />
                <h2 className="text-xl font-bold text-[#0F172A]">Payment Submission</h2>
            </div>

            {/* Blue Payment Card */}
            <div className="bg-[#0EA5E9] text-white rounded-xl p-5 sm:p-8 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold mb-4">Payment Details</h3>
                <div className="space-y-2 text-base sm:text-lg">
                    <p className="font-semibold">
                        Bank: <span className="font-normal opacity-90">MITS Institute Account</span>
                    </p>
                    <p className="font-semibold">
                        UPI ID: <span className="font-bold">mits.admission@sbi</span>
                    </p>
                    <p className="font-semibold">
                        Amount: <span className="font-bold">₹75,000</span> <span className="font-normal opacity-90">(admission fee)</span>
                    </p>
                </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                        Your UPI ID <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="yourname@bank"
                        {...register("upiId")}
                        aria-invalid={!!errors.upiId}
                        aria-describedby={errors.upiId ? "upiId-error" : undefined}
                        className={`w-full h-12 px-4 rounded-lg border text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-shadow shadow-sm ${errors.upiId ? 'border-red-400 bg-red-50/50' : 'border-[#CBD5E1]'}`}
                    />
                    {errors.upiId && (
                        <p className="text-xs text-red-500 mt-1" id="upiId-error">{errors.upiId.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                        Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="UPI Transaction Transfer ID"
                        {...register("transactionId")}
                        aria-invalid={!!errors.transactionId}
                        aria-describedby={errors.transactionId ? "transactionId-error" : undefined}
                        className={`w-full h-12 px-4 rounded-lg border text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-shadow shadow-sm ${errors.transactionId ? 'border-red-400 bg-red-50/50' : 'border-[#CBD5E1]'}`}
                    />
                    {errors.transactionId && (
                        <p className="text-xs text-red-500 mt-1" id="transactionId-error">{errors.transactionId.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                        Payment Screenshot <span className="text-red-500">*</span>
                    </label>
                    <label className={`w-full min-h-[160px] rounded-xl border-2 border-dashed hover:border-[#0EA5E9] bg-white flex flex-col items-center justify-center cursor-pointer transition-colors mt-2 group relative p-4 ${screenshotError ? 'border-red-400 bg-red-50/30' : 'border-[#CBD5E1]'}`}>
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept="image/png,image/jpeg"
                            onChange={handleFileChange}
                        />

                        {screenshotName ? (
                            <div className="flex flex-col items-center gap-2">
                                {previewUrl && (
                                    <div className="w-16 h-16 rounded-lg border border-[#E5E7EB] overflow-hidden">
                                        <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                                <p className="text-sm font-semibold text-green-600 truncate px-4">{screenshotName}</p>
                                <p className="text-xs text-[#94A3B8]">Click to change file</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-10 border-2 border-[#CBD5E1] group-hover:border-[#0EA5E9] rounded mb-3 flex items-center justify-center transition-colors">
                                    <div className="w-8 border-t-2 border-[#CBD5E1] group-hover:border-[#0EA5E9] transition-colors"></div>
                                </div>
                                <p className="text-[#94A3B8] text-sm group-hover:text-[#0EA5E9] transition-colors text-center px-4">
                                    Click to upload payment screenshot
                                </p>
                                <p className="text-xs text-[#CBD5E1] mt-1">PNG, JPG only (max 10MB)</p>
                            </>
                        )}
                    </label>
                    {screenshotError && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                            <p className="text-xs text-red-500">{screenshotError}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
