"use client";

export default function ProgressBar({ percent = 25 }: { percent?: number }) {
    return (
        <div className="px-6 pb-4">
            <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                    className="h-full bg-[#0EA5E9] rounded-full"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
