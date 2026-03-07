"use client";

import { useRouter } from "next/navigation";

export default function DocumentsActions() {
    const router = useRouter();

    return (
        <div className="flex items-center justify-between pt-6 mt-8 border-t border-[#E5E7EB]">
            {/* Left side button */}
            <button
                type="button"
                onClick={() => router.push('/admission/academic')}
                className="px-6 h-10 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-sm font-bold uppercase tracking-wide rounded-md transition-colors cursor-pointer"
            >
                Previous
            </button>

            {/* Right side button */}
            <button
                type="button"
                onClick={() => router.push('/admission/payment')}
                className="inline-flex items-center gap-2 px-6 h-10 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-bold rounded-md transition-colors cursor-pointer shadow-sm shadow-[#0EA5E9]/20"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload & Continue
            </button>
        </div>
    );
}
