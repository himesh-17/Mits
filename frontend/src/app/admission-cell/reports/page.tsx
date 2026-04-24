"use client";

import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiRefreshCw } from "react-icons/fi";

interface ApiRow {
  _id: string;
  status?: string;
}

export default function AdmissionCellReportsPage() {
  const [rows, setRows] = useState<ApiRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admission-cell/students?page=1&limit=50`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Failed to load");
        const payload = await response.json();
        setRows(payload.data?.applications || []);
      } catch (error) {
        console.error("Admission cell reports load error:", error);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const underReview = rows.filter((row) => row.status === "under_review").length;
    const awaitingReview = rows.filter((row) => row.status === "submitted").length;
    const docsVerified = rows.filter((row) => row.status === "documents_verified").length;
    const docsRejected = rows.filter((row) => row.status === "rejected").length;
    return { underReview, awaitingReview, docsVerified, docsRejected, rejectedTotal: docsRejected };
  }, [rows]);

  const maxValue = Math.max(1, stats.underReview, stats.awaitingReview, stats.docsVerified, stats.docsRejected, stats.rejectedTotal);

  const chartRows = [
    { label: "Under Review", value: stats.underReview, color: "bg-[#2DA8E1]" },
    { label: "Awaiting Review", value: stats.awaitingReview, color: "bg-[#8B5CF6]" },
    { label: "Docs Verified", value: stats.docsVerified, color: "bg-[#10B981]" },
    { label: "Docs Rejected", value: stats.docsRejected, color: "bg-[#EF4444]" },
    { label: "Total Rejected", value: stats.rejectedTotal, color: "bg-[#3F0D0D]" },
  ];

  return (
    <div className="space-y-4 [font-family:var(--font-poppins)]">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-poppins)] text-[43px] font-bold leading-none text-[#1E293B]">Admission Cell Reports</h1>
          <p className="mt-2 text-[14px] text-[#7B7B7B]">Verification workload & activity overview</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-[#D5D4D4] bg-white px-4 py-1.5 text-[12px] font-medium text-[#0F1724]">
            <FiRefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button className="inline-flex items-center gap-2 rounded-md border border-[#D5D4D4] bg-white px-4 py-1.5 text-[12px] font-medium text-[#0F1724]">
            <FiDownload className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: "Awaiting Review", value: stats.awaitingReview },
          { label: "Under Review", value: stats.underReview },
          { label: "Docs Verified", value: stats.docsVerified },
          { label: "Docs Rejected", value: stats.docsRejected },
          { label: "Rejected Total", value: stats.rejectedTotal },
        ].map((card) => (
          <div key={card.label} className="rounded-md border border-[#D5D4D4] bg-white p-4">
            <p className="text-[34px] font-bold leading-none text-[#111827]" style={{ fontFamily: "var(--font-poppins)" }}>{card.value}</p>
            <p className="mt-2 text-[12px] text-[#7B7B7B]">{card.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-md border border-[#D5D4D4] bg-white p-4">
        <h2 className="mb-4 font-[var(--font-poppins)] text-[30px] font-bold leading-none text-[#111827]">Verification Pipeline</h2>
        <div className="space-y-4">
          {[
            { label: "Submitted (Pending Review)", value: stats.awaitingReview },
            { label: "Under Review", value: stats.underReview },
            { label: "Documents Verified", value: stats.docsVerified },
            { label: "Documents Rejected", value: stats.docsRejected },
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <span className="text-[#64748B]">{item.label}</span>
                <span className="font-semibold text-[#111827]">{item.value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#E5E7EB]">
                <div className="h-1.5 rounded-full bg-[#2DA8E1]" style={{ width: `${Math.max(4, (item.value / maxValue) * 100)}%` }} />
              </div>
            </div>
          ))}
          <div className="pt-3 text-[13px] text-[#64748B]">
            Avg. Review Time <span className="float-right font-semibold text-[#111827]">2.3 days</span>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-[#D5D4D4] bg-white p-4">
        <h2 className="mb-5 font-[var(--font-poppins)] text-[30px] font-bold leading-none text-[#111827]">Admission Cell Breakdown</h2>
        <div className="space-y-4">
          {chartRows.map((item) => (
            <div key={item.label} className="grid grid-cols-[11rem_1fr] items-center gap-3">
              <p className="text-[12px] font-semibold text-[#0F1724]">{item.label}</p>
              <div className="h-7 rounded-sm bg-[#F1F5F9]">
                <div className={`h-7 rounded-sm ${item.color}`} style={{ width: `${(item.value / maxValue) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
