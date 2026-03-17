"use client";

import { Shapes } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { PersonalFormData } from "../../lib/validationSchemas";

const hobbies = [
    "Sports",
    "Music",
    "Arts/Painting",
    "Coding",
    "Dancing",
    "Photography",
];

export default function HobbiesSection() {
    const { watch, setValue } = useFormContext<PersonalFormData>();
    const currentHobbies = watch("hobbies") || [];

    const toggle = (hobby: string) => {
        const newHobbies = currentHobbies.includes(hobby)
            ? currentHobbies.filter((h) => h !== hobby)
            : [...currentHobbies, hobby];

        setValue("hobbies", newHobbies, { shouldValidate: true, shouldDirty: true });
    };

    return (
        <div className="space-y-5">
            {/* Section Title */}
            <div className="flex items-center gap-2">
                <Shapes className="w-5 h-5 text-[#0F172A]" />
                <h2 className="text-base font-bold text-[#0F172A]">
                    Hobbies & Extracurriculars
                </h2>
            </div>

            {/* Hobby Checkboxes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {hobbies.map((hobby) => {
                    const isSelected = currentHobbies.includes(hobby);
                    return (
                        <button
                            key={hobby}
                            type="button"
                            onClick={() => toggle(hobby)}
                            className={`flex items-center gap-2 h-11 md:h-10 px-3 rounded-md border text-sm font-medium transition-all cursor-pointer active:scale-[0.97] ${isSelected
                                ? "border-[#0EA5E9] bg-[#F0F9FF] text-[#0EA5E9]"
                                : "border-[#E5E7EB] bg-white text-[#0F172A] hover:border-[#94A3B8]"
                                }`}
                        >
                            <div
                                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected
                                    ? "border-[#0EA5E9] bg-[#0EA5E9]"
                                    : "border-[#D1D5DB]"
                                    }`}
                            >
                                {isSelected && (
                                    <svg
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                )}
                            </div>
                            {hobby}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
