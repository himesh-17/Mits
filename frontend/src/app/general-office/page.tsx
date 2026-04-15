"use client";

import { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import GeneralOfficeStats from "../../components/general-office/GeneralOfficeStats";
import VerificationApplicationsTable from "../../components/general-office/VerificationApplicationsTable";

export default function GeneralOfficePage() {
  const [stats, setStats] = useState({
    awaitingVerification: 0,
    documentsPending: 0,
    finalApprovals: 0,
    totalActiveApps: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/general-office/dashboard/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load dashboard statistics");
        }

        const payload = await response.json();
        setStats(payload.data);
      } catch (error) {
        console.error("Dashboard stats error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6 [font-family:var(--font-inter)]">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h1
            className="font-['Times_New_Roman',Times,serif] text-[48px] font-bold leading-none text-[#1E293B]"
          >
            Student Records Overview
          </h1>
          <p className="mt-2 text-[14px] leading-5 text-[#7B7B7B]">
            Monitor documents, fee clearances and admission progress
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-lg border border-[#D5D4D4] bg-white px-4 py-2 text-[13px] font-medium text-[#0F1724] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <FiRefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </section>

      <GeneralOfficeStats stats={stats} loading={loading} />

      <VerificationApplicationsTable />
    </div>
  );
}
