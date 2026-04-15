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
  <div className={`rounded-md p-3 text-center ${bgColor}`}>
    <p className={`text-[20px] font-bold leading-none ${textColor}`} style={{ fontFamily: "var(--font-poppins)" }}>{count}</p>
    <p className={`mt-2 text-[11px] font-semibold ${textColor} opacity-80`}>
      {label}
    </p>
  </div>
);

export default function ApplicationStatusBreakdown({
  statusData,
}: ApplicationStatusBreakdownProps) {
  return (
    <div className="rounded-lg border border-[#D5D4D4] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] md:p-6">
      <h2 className="mb-5 font-['Times_New_Roman',Times,serif] text-[30px] font-bold leading-none text-[#0F1724]">
        Application Status Breakdown
      </h2>

      <div className="space-y-3">
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
