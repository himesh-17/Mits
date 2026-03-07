"use client";

import React from 'react';

interface ProgressBarProps {
    percent?: number;
}

export default function ProgressBar({ percent = 0 }: ProgressBarProps) {
    return (
        <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden mb-8">
            <div
                className="h-full bg-[#0EA5E9] transition-all duration-500 ease-out"
                style={{ width: `${percent}%` }}
            />
        </div>
    );
}
