"use client";

interface StatusData {
  paymentPending: number;
  underReview: number;
  finalized: number;
}

interface ApplicationStatusBreakdownProps {
  statusData: StatusData;
}

const StatusBadge: React.FC<{
  label: string;
  count: number;
  bgColor: string;
  textColor: string;
}> = ({ label, count, bgColor, textColor }) => (
  <div className="flex items-center justify-between">
    <span className={`inline-flex rounded-sm px-3 py-1 text-[11px] font-semibold ${bgColor} ${textColor}`}>
      {label}
    </span>
    <span className="text-[14px] font-semibold text-[#111827]">{count}</span>
  </div>
);

export default function ApplicationStatusBreakdown({
  statusData,
}: ApplicationStatusBreakdownProps) {
  return (
    <div className="rounded-md border border-[#D5D4D4] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <h2 className="mb-4 font-[var(--font-poppins)] text-[30px] font-bold leading-none text-[#0F1724]">
        Application Status Breakdown
      </h2>

      <div className="space-y-5">
        <StatusBadge
          label="Payment Pending"
          count={statusData.paymentPending}
          bgColor="bg-[#FFEDD5]"
          textColor="text-[#C2410C]"
        />
        <StatusBadge
          label="Under Review"
          count={statusData.underReview}
          bgColor="bg-[#FEF3C7]"
          textColor="text-[#B45309]"
        />
        <StatusBadge
          label="Finalized"
          count={statusData.finalized}
          bgColor="bg-[#DCFCE7]"
          textColor="text-[#15803D]"
        />
      </div>
    </div>
  );
}
