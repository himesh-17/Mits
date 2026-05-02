"use client";

import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useAdmissionForm } from "../../context/AdmissionContext";

interface StepTabsProps {
    activeStep?: number;
}

const stepRoutes: Record<number, string> = {
    1: "/admission",
    2: "/admission/academic",
    3: "/admission/documents",
    4: "/admission/payment",
};

export default function StepTabs({ activeStep = 1 }: StepTabsProps) {
    const { formData } = useAdmissionForm();
    const highestStep = formData?.highestStep || 1;

    const steps = [
        { id: 1, label: "Personal" },
        { id: 2, label: "Academic" },
        { id: 3, label: "Documents" },
        { id: 4, label: "Payment" }
    ];

    return (
        <div className="flex items-center gap-2 md:gap-4 border-b border-[#E5E7EB] overflow-x-auto scrollbar-hide pb-px -mb-px">
            {steps.map((step) => {
                const isActive = step.id === activeStep;
                const isCompleted = step.id < activeStep;
                const isClickable = step.id <= highestStep;

                return (
                    <Link
                        key={step.id}
                        href={isClickable ? stepRoutes[step.id] : "#"}
                        onClick={(e) => {
                            if (!isClickable) {
                                e.preventDefault();
                            }
                        }}
                        className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-all min-w-fit ${isActive
                            ? 'border-[#0EA5E9] text-[#0EA5E9]'
                            : 'border-transparent text-[#94A3B8]'
                            } ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'}`}
                    >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${isCompleted
                            ? 'bg-[#16A34A] text-white'
                            : isActive
                                ? 'bg-[#0EA5E9] text-white'
                                : 'bg-[#F1F5F9] text-[#94A3B8]'
                            }`}>
                            {isCompleted ? <Check className="w-3 h-3" strokeWidth={3} /> : step.id}
                        </div>
                        <span className={`text-sm font-semibold whitespace-nowrap ${isCompleted ? 'text-[#16A34A]' : ''}`}>
                            {step.id}. {step.label}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
