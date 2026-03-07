"use client";

export default function AdmissionHeader({
    step = 1,
    title = "Personal Information",
    percentText = "25% Completed"
}: {
    step?: number;
    title?: string;
    percentText?: string;
}) {
    return (
        <div className="px-6 pt-6 pb-2">
            {/* Title Row */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#0F172A]">
                        Student Admission Form
                    </h1>
                    <p className="text-sm mt-1">
                        <span className="font-semibold text-[#0F172A]">Step {step} of 4</span>
                        <span className="text-[#0EA5E9]"> • {title}</span>
                    </p>
                </div>
                <div className="text-right text-sm">
                    <p className="text-[#64748B]">
                        Form Id: <span className="font-medium text-[#0F172A]">BTEO24O1035</span>
                    </p>
                    <p className="font-semibold text-[#0EA5E9]">{percentText}</p>
                </div>
            </div>
        </div>
    );
}
