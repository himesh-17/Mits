"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";

interface ApiRow {
  _id: string;
  fullName?: string;
  branchDisplayName?: string;
  branch?: string;
  status?: string;
  updatedAt?: string;
}

function statusLabel(status?: string) {
  if (status === "under_review") return "Under Review";
  if (status === "submitted") return "Awaiting Review";
  if (status === "documents_verified") return "Docs Verified";
  if (status === "rejected") return "Docs Rejected";
  return "Awaiting Review";
}

function statusTone(label: string) {
  if (label === "Under Review") return "bg-[#FEF3C7] text-[#B45309]";
  if (label === "Docs Verified") return "bg-[#DCFCE7] text-[#15803D]";
  if (label === "Docs Rejected") return "bg-[#FEE2E2] text-[#DC2626]";
  return "bg-[#F3E8FF] text-[#7C3AED]";
}

export default function AdmissionCellDashboardPage() {
  const [rows, setRows] = useState<ApiRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admission-cell/students?page=1&limit=5`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Failed to load");
        const payload = await response.json();
        setRows(payload.data?.applications || []);
      } catch (error) {
        console.error("Admission cell dashboard load error:", error);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const awaiting = rows.filter((row) => statusLabel(row.status) === "Awaiting Review").length;
    const underReview = rows.filter((row) => statusLabel(row.status) === "Under Review").length;
    const verified = rows.filter((row) => statusLabel(row.status) === "Docs Verified").length;
    const rejected = rows.filter((row) => statusLabel(row.status) === "Docs Rejected").length;
    return { awaiting, underReview, verified, rejected };
  }, [rows]);

  return (
    <div className="space-y-4 [font-family:var(--font-poppins)]">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-poppins)] text-[43px] font-bold leading-none text-[#1E293B]">
            Admission Cell Dashboard
          </h1>
          <p className="mt-2 text-[14px] text-[#7B7B7B]">Verification workload & activity overview</p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-md border border-[#D5D4D4] bg-white px-4 py-1.5 text-[12px] font-medium text-[#0F1724] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <FiRefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {[
          { label: "Awaiting Review", value: stats.awaiting },
          { label: "Under Review", value: stats.underReview },
          { label: "Docs Verified", value: stats.verified },
          { label: "Docs Rejected", value: stats.rejected },
        ].map((card) => (
          <div key={card.label} className="rounded-md border border-[#D5D4D4] bg-white p-4">
            <p className="text-[34px] font-bold leading-none text-[#111827]" style={{ fontFamily: "var(--font-poppins)" }}>{card.value}</p>
            <p className="mt-2 text-[12px] text-[#7B7B7B]">{card.label}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-md border border-[#D5D4D4] bg-white">
        <div className="border-b border-[#D5D4D4] px-4 py-3">
          <h2 className="font-[var(--font-poppins)] text-[30px] font-bold leading-none text-[#111827]">Pending Verification</h2>
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          {rows.slice(0, 3).map((row) => {
            const label = statusLabel(row.status);
            return (
              <div key={row._id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-[#0F1724]">{row.fullName || "Unknown"}</p>
                  <p className="text-[12px] text-[#6B7280]">{row.branchDisplayName || row.branch || "General"}</p>
                </div>
                <span className={`rounded-sm px-2.5 py-1 text-[11px] font-semibold ${statusTone(label)}`}>{label}</span>
                <Link href={`/admission-cell/applications/${row._id}`} className="text-[12px] font-semibold text-[#2DA8E1]">Review →</Link>
              </div>
            );
          })}

          {rows.length === 0 && (
            <div className="px-4 py-6 text-[13px] text-[#6B7280]">No applications found.</div>
          )}
        </div>
      </section>
    </div>
  );
}
