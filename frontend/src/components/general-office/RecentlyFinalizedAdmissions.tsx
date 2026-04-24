"use client";

interface Admission {
  id: string;
  name: string;
  date: string;
}

interface RecentlyFinalizedAdmissionsProps {
  admissions: Admission[];
}

export default function RecentlyFinalizedAdmissions({
  admissions,
}: RecentlyFinalizedAdmissionsProps) {
  return (
    <div className="rounded-md border border-[#D5D4D4] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <h2 className="mb-3 font-[var(--font-poppins)] text-[30px] font-bold leading-none text-[#0F1724]">
        Recently Finalized Admissions
      </h2>

      <div className="space-y-2">
        {admissions && admissions.length > 0 ? (
          admissions.map((admission) => (
            <div
              key={admission.id}
              className="flex items-center justify-between rounded-sm border border-[#E5E7EB] px-3 py-4"
            >
              <p className="text-[13px] font-medium text-[#0F1724]">{admission.name}</p>
              <p className="text-[12px] text-[#7B7B7B]">{admission.date}</p>
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-[#7B7B7B]">
              No finalized admissions yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
