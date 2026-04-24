"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
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
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-4 [font-family:var(--font-poppins)]">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h1
            className="font-[var(--font-poppins)] text-[43px] font-bold leading-none text-[#1E293B]"
          >
            Student Records Overview
          </h1>
          <p className="mt-2 text-[14px] leading-5 text-[#7B7B7B]">
            Monitor documents, fee clearances and admission progress
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md border border-[#D5D4D4] bg-white px-4 py-1.5 text-[12px] font-medium text-[#0F1724] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-[#F5F7FA] transition-colors cursor-pointer disabled:opacity-50"
        >
          <FiRefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </section>

      <GeneralOfficeStats stats={stats} loading={loading} />

      <VerificationApplicationsTable key={refreshKey} />
    </div>
  );
}
