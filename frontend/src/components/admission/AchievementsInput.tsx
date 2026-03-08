"use client";

import { useAdmissionForm } from "../../context/AdmissionContext";

export default function AchievementsInput() {
    const { formData, updateFormData } = useAdmissionForm();

    return (
        <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Other Achievements
            </label>
            <input
                type="text"
                placeholder="Hackathon winning, State level sports, etc..."
                value={formData.achievements}
                onChange={(e) => updateFormData({ achievements: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
            />
        </div>
    );
}
