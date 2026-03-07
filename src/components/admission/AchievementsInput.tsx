"use client";

export default function AchievementsInput() {
    return (
        <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Other Achievements
            </label>
            <input
                type="text"
                placeholder="Hackathon winning, State level sports, etc..."
                className="w-full h-10 px-3 rounded-md border border-[#E5E7EB] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
            />
        </div>
    );
}
