"use client";

import Link from "next/link";
import StatusBadge from "./StatusBadge";
import { FiArrowRight } from "react-icons/fi";

type ApplicationCardProps = {
    id: string;
    name: string;
    program: string;
    branch: string;
    round: string;
    status: string;
    date: string;
};

export default function ApplicationCard({ id, name, program, branch, round, status, date }: ApplicationCardProps) {
    return (
        <div className="admin-card-hover bg-white rounded-lg border border-black/10 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-[#0F1724] truncate">{name}</p>
                    <p className="text-[13px] text-[#64748B] mt-0.5">{program} — {branch}</p>
                </div>
                <StatusBadge status={status} />
            </div>

            <div className="flex items-center justify-between text-[12px] text-[#94A3B8]">
                <span>Round: {round}</span>
                <span>{date}</span>
            </div>

            <Link
                href={`/admin/applications/${id}`}
                className="admin-btn w-full h-9 rounded-md bg-[#F8FAFC] border border-black/10 text-[13px] font-medium text-[#0F1724] inline-flex items-center justify-center gap-1.5 hover:bg-[#EFF6FF] hover:text-[#2DA8E1] transition-colors"
            >
                View Details
                <FiArrowRight className="text-[14px]" />
            </Link>
        </div>
    );
}
