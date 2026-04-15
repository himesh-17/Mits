"use client";

interface BranchData {
  name: string;
  finalized: number;
  total: number;
  revenue: string;
}

interface BranchwiseSummaryProps {
  branchData: BranchData[];
}

const ProgressBar: React.FC<{ finalized: number; total: number }> = ({
  finalized,
  total,
}) => {
  const percentage = total > 0 ? (finalized / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className="h-full rounded-full bg-[#2DA8E1] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="min-w-10 text-[14px] font-semibold text-[#0F1724]">
        {finalized}/{total}
      </span>
    </div>
  );
};

export default function BranchwiseSummary({
  branchData,
}: BranchwiseSummaryProps) {
  return (
    <div className="rounded-lg border border-[#D5D4D4] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] md:p-6">
      <h2 className="mb-5 font-['Times_New_Roman',Times,serif] text-[30px] font-bold leading-none text-[#0F1724]">
        Branch-wise Summary
      </h2>

      <div className="space-y-5">
        {branchData.map((branch, index) => (
          <div key={index} className="rounded-md border border-[#E5E7EB] p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-[13px] font-semibold text-[#0F1724]">
                {branch.name}
              </h3>
              <span className="text-[12px] font-medium text-[#7B7B7B]">
                {branch.revenue}
              </span>
            </div>
            <ProgressBar finalized={branch.finalized} total={branch.total} />
          </div>
        ))}
      </div>
    </div>
  );
}
