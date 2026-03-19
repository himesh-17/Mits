"use client";

import React, { useState } from "react";
import { UploadCloud, UserRound, CheckCircle2, X, ImageIcon, AlertCircle } from "lucide-react";
import { useAdmissionForm } from "../../context/AdmissionContext";
import { validateFile } from "../../lib/validationSchemas";

export default function DocumentsUploadForm() {
    const { formData, updateFormData, validationErrors } = useAdmissionForm();
    const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
    const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});

    // NOTE: ids must match the backend Document model's docType enum
    const documents = [
        { id: "aadhar",       label: "Identity Proof (Aadhaar/Pan)",   required: true },
        { id: "marksheet_10", label: "10th Marksheet",                  required: true },
        { id: "marksheet_12", label: "12th Marksheet",                  required: true },
        { id: "jee_result",   label: "Entrance Exam Scorecard (Optional)", required: false },
        { id: "caste_certificate", label: "Category Certificate (if applicable)", required: false },
        { id: "domaicile",    label: "Domicile Certificate",            required: true },
        { id: "other",        label: "ABC ID",                          required: false },
        { id: "photo",        label: "Passport size photo",             required: true },
        { id: "signature",    label: "Signature",                       required: true },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type and size
        const error = validateFile(file);
        if (error) {
            setFileErrors((prev) => ({ ...prev, [docId]: error }));
            e.target.value = "";
            return;
        }

        // Clear errors
        setFileErrors((prev) => {
            const next = { ...prev };
            delete next[docId];
            return next;
        });

        // Generate preview
        const reader = new FileReader();
        reader.onload = (ev) => {
            setFilePreviews((prev) => ({ ...prev, [docId]: ev.target?.result as string }));
        };
        reader.readAsDataURL(file);

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
        setFilePreviews((prev) => {
            const next = { ...prev };
            delete next[docId];
            return next;
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3">
                <UserRound className="w-5 h-5 text-[#0F172A] mt-0.5" />
                <div>
                    <h2 className="text-lg font-bold text-[#0F172A]">Documents Upload</h2>
                    <p className="text-sm text-[#64748B] mt-1">
                        Upload clear scans in JPG/PNG format only (max 10MB each)
                    </p>
                </div>
            </div>

            {/* Document List */}
            <div className="space-y-4">
                {documents.map((doc) => {
                    const uploadedDoc = formData.docsUploaded?.[doc.id];
                    const preview = filePreviews[doc.id];
                    const docError = fileErrors[doc.id] || validationErrors[doc.id];

                    return (
                        <div key={doc.id}>
                            <div
                                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-white gap-3 transition-colors ${docError ? 'border-red-300 bg-red-50/30' : 'border-[#E5E7EB]'}`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#0F172A] mb-1">
                                        {doc.label} {doc.required && <span className="text-red-500">*</span>}
                                    </p>
                                    {uploadedDoc ? (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {preview && (
                                                <div className="w-10 h-10 rounded border border-[#E5E7EB] overflow-hidden flex-shrink-0">
                                                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
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
                                    <label className="inline-flex items-center gap-2 px-4 h-11 sm:h-9 bg-[#F0F9FF] text-[#0EA5E9] hover:bg-[#E0F2FE] border border-[#bae6fd] hover:border-[#7dd3fc] rounded-md text-sm font-semibold transition-colors cursor-pointer active:scale-[0.97] w-full sm:w-auto justify-center">
                                        <UploadCloud className="w-4 h-4" />
                                        {uploadedDoc ? "Change" : "Upload"}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/png,image/jpeg"
                                            onChange={(e) => handleFileChange(e, doc.id)}
                                        />
                                    </label>
                                </div>
                            </div>
                            {docError && (
                                <div className="flex items-center gap-1.5 mt-1.5 ml-1">
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                    <p className="text-xs text-red-500">{docError}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
