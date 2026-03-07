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
                {steps.map((step) => {
                    const isCompleted = step.num < activeStep;
                    const isActive = step.num === activeStep;

                    let textClass = "text-[#94A3B8] hover:text-[#64748B]";
                    let borderClass = "border-b-[3px] border-transparent";

                    if (isActive) {
                        textClass = "text-[#0EA5E9] font-bold";
                        borderClass = "border-b-[3px] border-[#0EA5E9]";
                    } else if (isCompleted) {
                        textClass = "text-[#16A34A] font-bold";
                    }

                    return (
                        <button
                            key={step.num}
                            className={`pb-3 text-center text-sm transition-colors cursor-pointer ${textClass} ${borderClass}`}
                        >
                            {step.num}. {step.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
