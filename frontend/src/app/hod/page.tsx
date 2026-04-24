"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiUsers, FiBarChart2 } from "react-icons/fi";

interface HodStats {
  admitted: number;
  total: number;
  branch?: string;
}

export default function HodDashboardPage() {
  const [stats, setStats] = useState<HodStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewStats = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hod/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error("Failed to load HOD stats");

        const payload = await response.json();
        setStats(payload.data);
      } catch (error) {
        console.error("Dashboard overview error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewStats();
  }, []);

  return (
    <div className="space-y-6 [font-family:var(--font-poppins)]">
      <section>
        <h1 className="text-[43px] font-bold leading-none text-[#1E293B]">
          HOD Dashboard
        </h1>
        <p className="mt-2 text-[14px] text-[#7B7B7B]">
          Welcome to the Head of Department portal. Overview of your branch admissions.
        </p>
      </section>

      {loading ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-[#D5D4D4] bg-white">
          <p className="text-sm text-[#64748B]">Loading overview...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-[#D5D4D4] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0F9FF] text-[#2DA8E1]">
                <FiUsers className="h-5 w-5" />
              </div>
              <h3 className="text-[13px] font-semibold text-[#64748B] uppercase tracking-wide">
                Finalized Admitted
              </h3>
            </div>
            <p className="text-3xl font-bold text-[#0F1724]">
              {stats?.admitted || 0}
            </p>
          </div>

          <div className="rounded-xl border border-[#D5D4D4] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#64748B]">
                <FiBarChart2 className="h-5 w-5" />
              </div>
              <h3 className="text-[13px] font-semibold text-[#64748B] uppercase tracking-wide">
                Total Applications
              </h3>
            </div>
            <p className="text-3xl font-bold text-[#0F1724]">
              {stats?.total || 0}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 mt-8">
        <Link
          href="/hod/students"
          className="group block rounded-xl border border-[#D5D4D4] bg-white p-6 transition-all hover:border-[#2DA8E1] hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1E293B] group-hover:text-[#2DA8E1]">
                View Finalized Students
              </h3>
              <p className="mt-1 text-sm text-[#64748B]">
                See the full list of students admitted to your branch.
              </p>
            </div>
            <FiUsers className="h-6 w-6 text-[#94A3B8] group-hover:text-[#2DA8E1]" />
          </div>
        </Link>

        <Link
          href="/hod/stats"
          className="group block rounded-xl border border-[#D5D4D4] bg-white p-6 transition-all hover:border-[#2DA8E1] hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1E293B] group-hover:text-[#2DA8E1]">
                View Branch Statistics
              </h3>
              <p className="mt-1 text-sm text-[#64748B]">
                Analyze admission trends and demographic breakdown.
              </p>
            </div>
            <FiBarChart2 className="h-6 w-6 text-[#94A3B8] group-hover:text-[#2DA8E1]" />
          </div>
        </Link>
      </div>
    </div>
  );
}
