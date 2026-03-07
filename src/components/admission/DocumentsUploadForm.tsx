"use client";

import { UploadCloud, UserRound } from "lucide-react";

export default function DocumentsUploadForm() {
    const documents = [
        { id: "identity", label: "Identity Proof (Aadhaar/Pan)", required: true },
        { id: "10th", label: "10th Marksheet", required: true },
        { id: "12th", label: "12th Marksheet", required: true },
        { id: "entrance", label: "Entrance Exam Scorecard (Optional)", required: false },
        { id: "category", label: "Category Certificate (if applicable)", required: false },
        { id: "domicile", label: "Domicile Certificate", required: true },
        { id: "abc", label: "ABC ID", required: false },
        { id: "photo", label: "Passport size photo", required: true },
        { id: "signature", label: "Signature", required: true },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3">
                <UserRound className="w-5 h-5 text-[#0F172A] mt-0.5" />
                <div>
                    <h2 className="text-lg font-bold text-[#0F172A]">Documents Upload</h2>
                    <p className="text-sm text-[#64748B] mt-1">
                        Upload clear scans in PDF/JPG/PNG format (max 10MB each)
                    </p>
                </div>
            </div>

            {/* Document List */}
            <div className="space-y-4">
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border border-[#E5E7EB] rounded-lg bg-white"
                    >
                        <div>
                            <p className="text-sm font-medium text-[#0F172A]">
                                {doc.label} {doc.required && <span className="text-red-500">*</span>}
                            </p>
                            <p className="text-xs text-[#94A3B8] mt-1">No file selected</p>
                        </div>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 px-4 h-9 bg-[#F0F9FF] text-[#0EA5E9] hover:bg-[#E0F2FE] border border-[#bae6fd] hover:border-[#7dd3fc] rounded-md text-sm font-semibold transition-colors cursor-pointer"
                        >
                            <UploadCloud className="w-4 h-4" />
                            Upload
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
