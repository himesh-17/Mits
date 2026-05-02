"use client";

import { useMemo } from "react";
import { getAdminData } from "../../lib/AdminStore";

type Application = {
  id: string;
  rollNo?: string;
  name: string;
  program?: string;
  course?: string;
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

  const statusClass = (status: string): string => {
    if (status === "Finalized" || status === "Payment Verified" || status === "Documents Verified") {
      return "bg-[#DCFCE7] text-[#15803D]";
    }

    if (status === "Payment Pending" || status === "Approval Pending" || status === "Under Review") {
      return "bg-[#FFEDD5] text-[#C2410C]";
    }

    if (status === "Rejected" || status === "Document Rejected" || status === "Payment Rejected") {
      return "bg-[#FEE2E2] text-[#B91C1C]";
    }

    return "bg-[#F1F5F9] text-[#475569]";
  };

  return (
    <section className="bg-white rounded-lg border border-black/10 overflow-hidden">
      <div className="h-11 px-4 border-b border-black/10 flex items-center">
        <h2 className="font-['Times_New_Roman',Times,serif] text-[16px] leading-6 font-bold text-[#0F1724]">Recent Activity</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-180">
          <thead>
            <tr className="h-9 bg-[#EEF2F6] text-[12px] font-semibold text-[#334155]">
              <th className="px-4">Roll No</th>
              <th className="px-4">Name</th>
              <th className="px-4">Program</th>
              <th className="px-4">Status</th>
              <th className="px-4">Date</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => {
              const normalizedStatus = String(item.status || "Draft");
              const program = String(item.program || item.course || "-");

              return (
                <tr
                  key={item.id}
                  className="admin-table-row h-12.5 border-t border-[#E2E8F0] text-[13px] text-[#0F1724]"
                >
                  <td className="px-4 font-semibold">{item.rollNo || "-"}</td>
                  <td className="px-4">{item.name}</td>
                  <td className="px-4">{program}</td>
                  <td className="px-4">
                    <span
                      className={`admin-status-pill inline-flex h-5.5 items-center px-2 rounded-md text-[11px] font-semibold ${statusClass(normalizedStatus)}`}
                    >
                      {normalizedStatus}
                    </span>
                  </td>
                  <td className="px-4 text-[#334155]">{item.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
