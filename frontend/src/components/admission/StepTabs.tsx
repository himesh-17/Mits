"use client";

import React from 'react';
import { Check } from 'lucide-react';

interface StepTabsProps {
    activeStep?: number;
}

export default function StepTabs({ activeStep = 1 }: StepTabsProps) {
    const steps = [
        { id: 1, label: "Personal" },
        { id: 2, label: "Academic" },
        { id: 3, label: "Documents" },
        { id: 4, label: "Payment" }
    ];

    return (
        <div className="flex items-center gap-2 md:gap-4 border-b border-[#E5E7EB]">
            {steps.map((step) => {
                const isActive = step.id === activeStep;
                const isCompleted = step.id < activeStep;

                return (
                    <div
                        key={step.id}
                        className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-all min-w-fit ${isActive
                                ? 'border-[#0EA5E9] text-[#0EA5E9]'
                                : 'border-transparent text-[#94A3B8]'
                            }`}
                    >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isCompleted
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
                    </div>
                );
            })}
        </div>
    );
}
