"use client";

import React from "react";
import { UploadCloud, UserRound, CheckCircle2, X } from "lucide-react";
import { useAdmissionForm } from "../../context/AdmissionContext";

export default function DocumentsUploadForm() {
    const { formData, updateFormData } = useAdmissionForm();
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

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size validation
        if (file.size > MAX_FILE_SIZE) {
            alert(`File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            // clear the input
            e.target.value = "";
            return;
        }

        const newDocs = {
            ...formData.docsUploaded,
            [docId]: { name: file.name, size: file.size, type: file.type }
        };
        updateFormData({ docsUploaded: newDocs });
    };

    const removeDoc = (docId: string) => {
        const newDocs = { ...formData.docsUploaded };
        delete newDocs[docId];
        updateFormData({ docsUploaded: newDocs });
    };

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
                {documents.map((doc) => {
                    const uploadedDoc = formData.docsUploaded?.[doc.id];
                    return (
                        <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 border border-[#E5E7EB] rounded-lg bg-white"
                        >
                            <div className="flex-1 pr-4 whitespace-nowrap overflow-hidden text-ellipsis">
                                <p className="text-sm font-medium text-[#0F172A] mb-1">
                                    {doc.label} {doc.required && <span className="text-red-500">*</span>}
                                </p>
                                {uploadedDoc ? (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <p className="text-sm text-green-600 font-medium truncate" title={uploadedDoc.name}>
                                            {uploadedDoc.name} <span className="text-xs text-gray-400 font-normal">({(uploadedDoc.size! / 1024 / 1024).toFixed(2)}MB)</span>
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => removeDoc(doc.id)}
                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer ml-1 text-gray-400 hover:text-red-500"
                                            title="Remove file"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-xs text-[#94A3B8]">No file selected</p>
                                )}
                            </div>

                            <div className="flex-shrink-0">
                                <label className="inline-flex items-center gap-2 px-4 h-9 bg-[#F0F9FF] text-[#0EA5E9] hover:bg-[#E0F2FE] border border-[#bae6fd] hover:border-[#7dd3fc] rounded-md text-sm font-semibold transition-colors cursor-pointer">
                                    <UploadCloud className="w-4 h-4" />
                                    {uploadedDoc ? "Change" : "Upload"}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        onChange={(e) => handleFileChange(e, doc.id)}
                                    />
                                </label>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
