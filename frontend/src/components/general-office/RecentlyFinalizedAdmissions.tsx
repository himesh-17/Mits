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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-[#0F1724] mb-6 font-serif">
        Recently Finalized Admissions
      </h2>

      <div className="space-y-4">
        {admissions && admissions.length > 0 ? (
          admissions.map((admission) => (
            <div
              key={admission.id}
              className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2DA8E1] bg-opacity-10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-[#2DA8E1]">
                    {admission.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F1724]">
                    {admission.name}
                  </p>
                  <p className="text-xs text-[#7B7B7B]">{admission.date}</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-[#DCFCE7] rounded-full">
                <span className="text-xs font-medium text-[#15803D]">
                  Finalized
                </span>
              </div>
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
