"use client";

import React from "react";
import { CreditCard, UploadCloud, CheckCircle2 } from "lucide-react";
import { useAdmissionForm } from "../../context/AdmissionContext";

export default function PaymentSubmission() {
    const { formData, updateFormData } = useAdmissionForm();
    const screenshotName = formData.docsUploaded?.["payment"]?.name;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert("File size exceeds 10MB limit.");
            e.target.value = "";
            return;
        }

        const newDocs = {
            ...formData.docsUploaded,
            payment: { name: file.name, size: file.size, type: file.type }
        };
        updateFormData({ docsUploaded: newDocs });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-[#0F172A]" />
                <h2 className="text-xl font-bold text-[#0F172A]">Payment Submission</h2>
            </div>

            {/* Blue Payment Card */}
            <div className="bg-[#0EA5E9] text-white rounded-xl p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-4">Payment Details</h3>
                <div className="space-y-2 text-lg">
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
                        value={formData.upiId || ""}
                        onChange={(e) => updateFormData({ upiId: e.target.value })}
                        className="w-full h-12 px-4 rounded-lg border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-shadow shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                        Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="UPI Transaction Transfer ID"
                        value={formData.transactionId || ""}
                        onChange={(e) => updateFormData({ transactionId: e.target.value })}
                        className="w-full h-12 px-4 rounded-lg border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-shadow shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                        Payment Screenshot <span className="text-red-500">*</span>
                    </label>
                    <label className="w-full h-40 rounded-xl border-2 border-dashed border-[#CBD5E1] hover:border-[#0EA5E9] bg-white flex flex-col items-center justify-center cursor-pointer transition-colors mt-2 group relative">
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={handleFileChange}
                        />

                        {screenshotName ? (
                            <div className="flex flex-col items-center gap-2">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
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
                            </>
                        )}
                    </label>
                </div>
            </div>
        </div>
    );
}
