"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiRefreshCw, FiPlus, FiUpload } from "react-icons/fi";
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
      name: string;
      course: string;
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
      }
    } catch {
      setFetchError("Could not load live dashboard data. Showing local data.");
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
    <section className="w-full space-y-5 [font-family:var(--font-inter)]">
      <div className="flex flex-col gap-3 lg:h-17.5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-['Times_New_Roman',Times,serif] text-[34px] md:text-[38px] leading-10.5 font-bold text-[#0F172A]">
            Admission Dashboard
          </h1>
          <p className="text-[15px] leading-5.5 text-[#94A3B8]">
            Review your daily metrics and student data uploads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            className="h-9.5 px-4 border border-black/10 rounded-md bg-white inline-flex items-center gap-2 text-[13px] text-[#0F1724]"
            type="button"
          >
            <FiRefreshCw size={14} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            onClick={() => {
              router.push("/admin/rounds");
            }}
            className="h-9.5 px-4 border border-black/10 rounded-md bg-white inline-flex items-center gap-2 text-[13px] text-[#0F1724]"
            type="button"
          >
            <FiPlus size={14} />
            New Round
          </button>

          <button
            type="button"
            onClick={() => {
              router.push("/admin/excel-upload");
            }}
            className="h-9.5 px-4 border border-[#2DA8E1] rounded-md bg-[#2DA8E1] inline-flex items-center gap-2 text-[13px] text-white"
          >
            <FiUpload size={14} />
            Excel Upload
          </button>
        </div>
      </div>

      {fetchError ? (
        <p className="text-[13px] text-[#B45309]">{fetchError}</p>
      ) : null}

      <StatCards refresh={refresh} metrics={dashboardData?.cards || null} />
      <RecentActivity refresh={refresh} rows={dashboardData?.recentActivity || null} />
      <Charts refresh={refresh} breakdown={dashboardData?.breakdown || null} />
    </section>
  );
}
