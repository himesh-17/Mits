"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface PaymentActionsProps {
    onSubmit: () => void;
}

export default function PaymentActions({ onSubmit }: PaymentActionsProps) {
    const router = useRouter();

    return (
        <div className="flex items-center justify-between pt-8 border-t border-[#E5E7EB]">
            {/* Left side button */}
            <button
                type="button"
                onClick={() => router.push('/admission/documents')}
                className="px-6 h-10 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-sm font-bold uppercase tracking-wide rounded-md transition-colors cursor-pointer"
            >
                Previous
            </button>

            {/* Right side button */}
            <button
                type="button"
                onClick={onSubmit}
                className="px-6 h-10 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-bold transition-colors cursor-pointer shadow-sm shadow-[#0EA5E9]/20 rounded-md"
            >
                Submit Payment
            </button>
        </div>
    );
}
