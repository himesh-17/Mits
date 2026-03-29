"use client";

import { useMemo } from "react";
import { getAdminData } from "../../lib/AdminStore";

type Application = {
  id: string;
  name: string;
  course: string;
  status: string;
  date: string;
};

type RecentActivityProps = {
  refresh: boolean;
  rows?: Application[] | null;
};

export default function RecentActivity({ refresh, rows }: RecentActivityProps) {
  const data = useMemo(() => {
    if (Array.isArray(rows)) {
      return rows.slice(0, 6);
    }

    return (getAdminData() as Application[]).slice(0, 6);
  }, [refresh, rows]);

  return (
    <section className="bg-white rounded-lg border border-black/10 overflow-hidden">
      <div className="h-11 px-4 border-b border-black/10 flex items-center">
        <h2 className="font-['Times_New_Roman',Times,serif] text-[16px] leading-6 font-bold text-[#0F1724]">Recent Activity</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-215">
          <thead>
            <tr className="h-9 bg-[#EEF2F6] text-[12px] font-semibold text-[#334155]">
              <th className="px-4">ID</th>
              <th className="px-4">Name</th>
              <th className="px-4">Course</th>
              <th className="px-4">Status</th>
              <th className="px-4">Date</th>
              <th className="px-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => {
              const isPending = item.status === "pending";

              return (
                <tr
                  key={item.id}
                  className="h-12.5 border-t border-[#E2E8F0] text-[13px] text-[#0F1724]"
                >
                  <td className="px-4 font-semibold">{item.id}</td>
                  <td className="px-4">{item.name}</td>
                  <td className="px-4">{item.course}</td>
                  <td className="px-4 capitalize">
                    <span
                      className={`inline-flex h-5.5 items-center px-2 rounded-md text-[11px] font-semibold ${
                        isPending
                          ? "bg-[#FFF4E5] text-[#9A6200]"
                          : "bg-[#E8F8EE] text-[#1F7A46]"
                      }`}
                    >
                      {isPending ? "pending" : "finalized"}
                    </span>
                  </td>
                  <td className="px-4 text-[#334155]">{item.date}</td>
                  <td className="px-4">
                    <button
                      className={`h-7 px-3 rounded-md text-[11px] font-semibold border ${
                        isPending
                          ? "border-[#2DA8E1] text-[#2DA8E1] bg-[#F0FAFF]"
                          : "border-[#1F7A46] text-[#1F7A46] bg-[#ECFDF3]"
                      }`}
                    >
                      {isPending ? "Review" : "View"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
