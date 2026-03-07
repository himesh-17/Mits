"use client";

import { CreditCard, UploadCloud } from "lucide-react";

export default function PaymentSubmission() {
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
                        className="w-full h-12 px-4 rounded-lg border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-shadow shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                        Payment Screenshot <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full h-40 rounded-xl border-2 border-dashed border-[#CBD5E1] hover:border-[#0EA5E9] bg-white flex flex-col items-center justify-center cursor-pointer transition-colors mt-2 group">
                        <div className="w-12 h-10 border-2 border-[#CBD5E1] group-hover:border-[#0EA5E9] rounded mb-3 flex items-center justify-center transition-colors">
                            <div className="w-8 border-t-2 border-[#CBD5E1] group-hover:border-[#0EA5E9] transition-colors"></div>
                        </div>
                        <p className="text-[#94A3B8] text-sm group-hover:text-[#0EA5E9] transition-colors text-center px-4">
                            Click to upload payment screenshot
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
