"use client";

import { FiX, FiExternalLink } from "react-icons/fi";

type DocumentViewerProps = {
    fileUrl: string;
    fileName: string;
    mimeType?: string;
    onClose: () => void;
};

export default function DocumentViewer({ fileUrl, fileName, mimeType, onClose }: DocumentViewerProps) {
    const isPdf = mimeType?.includes("pdf") || fileUrl.endsWith(".pdf");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0] shrink-0">
                    <h3 className="text-[15px] font-semibold text-[#0F1724] truncate pr-4">{fileName}</h3>
                    <div className="flex items-center gap-2">
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-btn h-8 px-3 rounded-md border border-black/10 bg-white text-[12px] font-medium text-[#0F1724] inline-flex items-center gap-1.5"
                        >
                            <FiExternalLink className="text-[13px]" />
                            Open
                        </a>
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-8 w-8 rounded-md hover:bg-[#F1F5F9] inline-flex items-center justify-center text-[#64748B] transition-colors"
                        >
                            <FiX className="text-[18px]" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#F8FAFC]">
                    {isPdf ? (
                        <iframe
                            src={fileUrl}
                            className="w-full h-full min-h-[60vh] rounded-md border border-[#E2E8F0]"
                            title={fileName}
                        />
                    ) : (
                        <img
                            src={fileUrl}
                            alt={fileName}
                            className="max-w-full max-h-[70vh] object-contain rounded-md shadow-sm"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
