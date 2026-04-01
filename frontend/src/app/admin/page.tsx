"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiRefreshCw, FiPlus } from "react-icons/fi";
import { api } from "../../utils/api";

const StatCards = dynamic(() => import("../../components/admin/StatCards"), {
  ssr: false,
});
const RecentActivity = dynamic(
  () => import("../../components/admin/RecentActivity"),
  { ssr: false },
);
const Charts = dynamic(() => import("../../components/admin/Charts"), {
  ssr: false,
});
const VerificationCards = dynamic(() => import("../../components/admin/VerificationCards"), {
  ssr: false,
});

export default function AdminDashboard() {
  const router = useRouter();
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<{
    cards: {
      totalApplications: number;
      uploadedToday: number;
      pendingVerifications: number;
      finalized: number;
      totalEligibleStudents: number;
      matchedStudents: number;
      awaitingApplications: number;
    };
    breakdown: {
      finalized: number;
      pending: number;
      rejected: number;
      draft: number;
      total: number;
    };
    recentActivity: Array<{
      id: string;
      rollNo?: string;
      name: string;
      program?: string;
      status: string;
      date: string;
    }>;
  } | null>(null);
  const [fetchError, setFetchError] = useState("");

  const fetchDashboard = async () => {
    try {
      setFetchError("");
      const response = await api.get("/api/admin/dashboard", {
        params: { recentLimit: 6 },
      });

      const payload = response?.data?.data || null;
      if (payload?.cards && payload?.breakdown && Array.isArray(payload?.recentActivity)) {
        setDashboardData(payload);
        return;
      }

      setDashboardData(null);
      setFetchError("Could not load live dashboard data; no live data available.");
    } catch {
      setFetchError("Could not load live dashboard data; no live data available.");
      setDashboardData(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchDashboard();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // 🔁 Refresh
  const handleRefresh = () => {
    setLoading(true);

    setTimeout(async () => {
      await fetchDashboard();
      setRefresh((prev) => !prev);
      setLoading(false);
    }, 350);
  };

  return (
    <section className="admin-section-enter w-full space-y-8 [font-family:var(--font-inter)]">
      <div className="flex flex-col gap-3 lg:h-17.5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-['Times_New_Roman',Times,serif] text-[34px] md:text-[38px] font-bold text-[#0F172A]">
            Verification Queue
          </h1>
          <p className="text-[15px] leading-5.5 text-[#94A3B8]">
            Review and verify student documents
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            className="admin-btn h-9.5 px-4 border border-black/10 rounded-md bg-white inline-flex items-center gap-2 text-[13px] text-[#0F1724]"
            type="button"
          >
            <FiRefreshCw size={14} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <VerificationCards
        waitingReview={dashboardData?.breakdown?.draft || 0}
        underReview={dashboardData?.breakdown?.pending || 0}
        docsRejected={dashboardData?.breakdown?.rejected || 0}
      />

      <RecentActivity refresh={refresh} rows={dashboardData?.recentActivity || null} />
    </section>
  );
}
