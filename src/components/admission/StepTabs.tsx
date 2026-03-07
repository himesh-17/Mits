"use client";

const steps = [
    { num: 1, label: "Personal" },
    { num: 2, label: "Academic" },
    { num: 3, label: "Documents" },
    { num: 4, label: "Payment" },
];

export default function StepTabs({ activeStep = 1 }: { activeStep?: number }) {
    return (
        <div className="px-6 pb-4">
            <div className="grid grid-cols-4 border-b border-[#E5E7EB]">
                {steps.map((step) => (
                    <button
                        key={step.num}
                        className={`py-3 text-center text-sm font-medium transition-colors cursor-pointer ${step.num === activeStep
                                ? "text-[#0EA5E9] border-b-2 border-[#0EA5E9]"
                                : "text-[#64748B] hover:text-[#0F172A] border-b-2 border-transparent"
                            }`}
                    >
                        {step.num}. {step.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
