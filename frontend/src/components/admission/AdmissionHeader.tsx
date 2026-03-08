"use client";

import React from 'react';

interface AdmissionHeaderProps {
    step?: number;
    title?: string;
    percentText?: string;
}

export default function AdmissionHeader({
    step = 1,
    title = "Personal Details",
    percentText = "0% Completed"
}: AdmissionHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">Student Admission Form</h1>
                <p className="text-sm font-medium text-[#64748B] mt-1">
                    Step {step} of 4 • <span className="text-[#0EA5E9]">{title}</span>
                </p>
            </div>
            <div className="text-right">
                <p className="text-sm font-bold text-[#0F172A]">Form Id: <span className="text-[#0EA5E9]">BTEO24O1035</span></p>
                <p className="text-sm font-bold text-[#0EA5E9] mt-0.5">{percentText}</p>
            </div>
        </div>
    );
}
