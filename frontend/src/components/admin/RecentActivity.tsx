"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
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

    if (status === "Payment Pending" || status === "Approval Pending" || status === "Under Review" || status === "Withdrawal") {
      return "bg-[#FFEDD5] text-[#C2410C]";
    }

    if (status === "Rejected" || status === "Document Rejected" || status === "Payment Rejected") {
      return "bg-[#FEE2E2] text-[#B91C1C]";
    }

    return "bg-[#F1F5F9] text-[#475569]";
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between py-2">
        <h2 className="font-['Times_New_Roman',Times,serif] text-[20px] font-bold text-[#0F1724]">
          Applications Pending Verification
        </h2>
      </div>

      <div className="space-y-3">
        {data.map((item, idx) => {
          const normalizedStatus = String(item.status || "Draft");
          const program = String(item.program || item.course || "-");

          return (
            <div
              key={item.id}
              className="group flex items-center justify-between rounded-xl border border-black/[0.05] bg-white p-5 shadow-sm transition-all hover:border-[#2DA8E1]/30 hover:shadow-md"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-lg font-bold text-white shadow-inner">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#0F1724] group-hover:text-[#2563EB] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[13px] text-[#8A98A8]">
                    student{idx + 1}@gmail.com • {program}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="hidden sm:block text-center border-r border-black/[0.05] pr-12 last:border-0 last:pr-0">
                  <p className="text-[10px] font-bold text-[#8A98A8] uppercase tracking-wider mb-1">Documents</p>
                  <p className="text-[14px] font-bold text-[#0F1724]">0 files</p>
                </div>

                <div className="min-w-[120px] text-center">
                  <span
                    className={`inline-flex h-7 items-center px-4 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusClass(normalizedStatus)}`}
                  >
                    {normalizedStatus}
                  </span>
                </div>

                <Link
                  href={`/admin/applications/${item.id}`}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#2563EB] px-6 text-[14px] font-bold text-white transition-all hover:bg-[#1D4ED8] hover:shadow-lg active:scale-95"
                >
                  Review
                  <FiArrowRight />
                </Link>
              </div>
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#CFD7E3] bg-white py-16">
            <p className="text-[#64748B] font-medium">No applications pending verification.</p>
          </div>
        )}
      </div>
    </section>
  );
}
