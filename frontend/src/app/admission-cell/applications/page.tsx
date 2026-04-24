"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface ApiRow {
  _id: string;
  fullName?: string;
  branchDisplayName?: string;
  branch?: string;
  allottedRound?: string;
  status?: string;
  updatedAt?: string;
}

function statusLabel(status?: string) {
  if (status === "under_review") return "Under Review";
  if (status === "documents_verified") return "Finalized";
  if (status === "rejected") return "Rejected";
  return "Payment Pending";
}

function statusTone(label: string) {
  if (label === "Finalized") return "bg-[#DCFCE7] text-[#15803D]";
  if (label === "Under Review") return "text-[#B45309]";
  if (label === "Rejected") return "bg-[#FEE2E2] text-[#DC2626]";
  return "bg-[#FFEDD5] text-[#C2410C]";
}

function formatUpdated(value?: string) {
  if (!value) return "24 Mar 2026, 10:45pm";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "24 Mar 2026, 10:45pm";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date).replace(",", "").replace(" ", " ");
}

export default function AdmissionCellApplicationsPage() {
  const [rows, setRows] = useState<ApiRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admission-cell/students?page=1&limit=20`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Failed to load");
        const payload = await response.json();
        setRows(payload.data?.applications || []);
      } catch (error) {
        console.error("Admission cell applications load error:", error);
      }
    };

    load();
  }, []);

  const total = rows.length;

  return (
    <div className="space-y-3 [font-family:var(--font-poppins)]">
      <h1 className="font-[var(--font-poppins)] text-[43px] font-bold leading-none text-[#1E293B]">All Applications</h1>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <button className="flex h-11 items-center justify-between rounded-md border border-[#D5D4D4] bg-white px-4 text-[13px] text-[#64748B]">
          <span>Status: All Statuses</span>
          <span>⌄</span>
        </button>
        <button className="flex h-11 items-center justify-between rounded-md border border-[#D5D4D4] bg-white px-4 text-[13px] text-[#64748B]">
          <span>Program: All Programs</span>
          <span>⌄</span>
        </button>
      </section>

      <section className="overflow-hidden rounded-md border border-[#D5D4D4] bg-white">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-[#D5D4D4] bg-[#F9FAFB] text-left text-[12px] font-semibold text-[#0F1724]">
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Program/Branch</th>
              <th className="px-4 py-3">Round</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 3).map((row) => {
              const label = statusLabel(row.status);
              const tone = statusTone(label);
              return (
                <tr key={row._id} className="border-b border-[#E5E7EB] last:border-b-0">
                  <td className="px-4 py-4 text-[13px] text-[#1E293B]">{row.fullName || "Unknown"}</td>
                  <td className="px-4 py-4 text-[13px] text-[#334155]">{row.branchDisplayName || row.branch || "General"}</td>
                  <td className="px-4 py-4 text-[13px] text-[#334155]">{row.allottedRound || "Admission 23-24"}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-sm px-2.5 py-1 text-[11px] font-semibold ${tone}`}>{label}</span>
                  </td>
                  <td className="px-4 py-4 text-[12px] text-[#334155]">{formatUpdated(row.updatedAt)}</td>
                  <td className="px-4 py-4 text-right">
                    <Link href={`/admission-cell/applications/${row._id}`} className="text-[12px] font-semibold text-[#2DA8E1]">View →</Link>
                  </td>
                </tr>
              );
            })}
            {total === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-[13px] text-[#64748B]">No applications found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
