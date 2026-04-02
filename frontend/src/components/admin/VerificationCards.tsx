"use client";

import { FiClock, FiEye, FiXCircle, FiRefreshCw } from "react-icons/fi";
import type { ReactNode } from "react";

type CardData = {
    title: string;
    count: number;
    icon: ReactNode;
    color: string;
    bgTint: string;
};

type VerificationCardsProps = {
    waitingReview: number;
    underReview: number;
    docsRejected: number;
    reuploadRequested: number;
};

export default function VerificationCards({ waitingReview, underReview, docsRejected, reuploadRequested }: VerificationCardsProps) {
    const cards: CardData[] = [
        { title: "Waiting Review", count: waitingReview, icon: <FiClock />, color: "#F59E0B", bgTint: "#FFFBEB" },
        { title: "Under Review", count: underReview, icon: <FiEye />, color: "#3B82F6", bgTint: "#EFF6FF" },
        { title: "Docs Rejected", count: docsRejected, icon: <FiXCircle />, color: "#EF4444", bgTint: "#FEF2F2" },
        { title: "Re-upload Requested", count: reuploadRequested, icon: <FiRefreshCw />, color: "#8B5CF6", bgTint: "#F5F3FF" },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className="admin-card-hover bg-white rounded-xl border border-black/[0.06] p-8 flex flex-col items-center justify-center text-center shadow-sm"
                >
                    <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center text-[22px] mb-4"
                        style={{ backgroundColor: card.bgTint, color: card.color }}
                    >
                        {card.icon}
                    </div>
                    <h2 className="font-['Times_New_Roman',Times,serif] text-[42px] leading-tight font-bold text-[#0F1724]">
                        {card.count}
                    </h2>
                    <p className="text-[13px] font-bold uppercase tracking-[0.6px] text-[#8A98A8] mt-1">
                        {card.title}
                    </p>
                </div>
            ))}
        </div>
    );
}
