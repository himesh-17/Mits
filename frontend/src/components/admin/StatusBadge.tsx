"use client";

type StatusBadgeProps = {
    status: string;
    size?: "sm" | "md";
};

const STATUS_MAP: Record<string, { bg: string; text: string }> = {
    Finalized: { bg: "bg-[#DCFCE7]", text: "text-[#15803D]" },
    "Payment Verified": { bg: "bg-[#DCFCE7]", text: "text-[#15803D]" },
    "Documents Verified": { bg: "bg-[#DCFCE7]", text: "text-[#15803D]" },
    Approved: { bg: "bg-[#DCFCE7]", text: "text-[#15803D]" },
    "Payment Pending": { bg: "bg-[#FFEDD5]", text: "text-[#C2410C]" },
    "Approval Pending": { bg: "bg-[#FFEDD5]", text: "text-[#C2410C]" },
    "Under Review": { bg: "bg-[#FFEDD5]", text: "text-[#C2410C]" },
    Submitted: { bg: "bg-[#DBEAFE]", text: "text-[#1D4ED8]" },
    Rejected: { bg: "bg-[#FEE2E2]", text: "text-[#B91C1C]" },
    "Document Rejected": { bg: "bg-[#FEE2E2]", text: "text-[#B91C1C]" },
    "Payment Rejected": { bg: "bg-[#FEE2E2]", text: "text-[#B91C1C]" },
    Draft: { bg: "bg-[#F1F5F9]", text: "text-[#475569]" },
    Withdrawal: { bg: "bg-[#FFEDD5]", text: "text-[#C2410C]" },
    "Not Matched": { bg: "bg-[#F1F5F9]", text: "text-[#475569]" },
    "Changes Requested": { bg: "bg-[#FEF9C3]", text: "text-[#854D0E]" },
    "Re-upload Required": { bg: "bg-[#FEF3C7]", text: "text-[#92400E]" },
};

function getStatusStyle(status: string) {
    return STATUS_MAP[status] || { bg: "bg-[#F1F5F9]", text: "text-[#475569]" };
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
    const style = getStatusStyle(status);
    const sizeClass = size === "md" ? "h-7 px-3 text-[13px]" : "h-5.5 px-2 text-[11px]";

    return (
        <span className={`inline-flex items-center rounded-md font-semibold whitespace-nowrap ${sizeClass} ${style.bg} ${style.text}`}>
            {status}
        </span>
    );
}

export { getStatusStyle };
