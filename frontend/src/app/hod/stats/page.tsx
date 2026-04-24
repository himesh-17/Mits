"use client";

import { useEffect, useState } from "react";
import { FiBarChart2, FiPieChart } from "react-icons/fi";

interface BranchStat {
  _id: string;
  count: number;
}

interface StatsPayload {
  admitted: number;
  total: number;
  byBranch: BranchStat[];
}

export default function HodStatsPage() {
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hod/branches`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error("Failed to load branches");

        const payload = await response.json();
        const nextBranches: string[] = payload.data?.branches || [];
        setBranches(nextBranches);
        // We can optionally not set a default branch here if we want to see ALL branches breakdown
        // But let's follow the same pattern as students page
      } catch (error) {
        console.error("Failed to load HOD branches:", error);
      }
    };

    loadBranches();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const query = selectedBranch ? `?branch=${encodeURIComponent(selectedBranch)}` : "";
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hod/stats${query}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (!response.ok) throw new Error("Failed to load stats");
        
        const payload = await response.json();
        setStats(payload.data);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [selectedBranch]);

  return (
    <div className="space-y-6 [font-family:var(--font-poppins)]">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[43px] font-bold leading-none text-[#1E293B]">
            Branch Statistics
          </h1>
          <p className="mt-2 text-[14px] text-[#7B7B7B]">
            Analyze admission counts and application numbers across branches.
          </p>
        </div>
      </section>

      {branches.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-[22rem]">
          <div className="rounded-md border border-[#D5D4D4] bg-white p-3">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
              Filter by Department / Branch
            </p>
            <select
              value={selectedBranch}
              onChange={(event) => setSelectedBranch(event.target.value)}
              className="h-10 w-full rounded-md border border-[#D5D4D4] bg-white px-3 text-[13px] text-[#0F1724] outline-none"
            >
              <option value="">All Available Branches</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
        </section>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-[#D5D4D4] bg-white">
          <p className="text-sm text-[#64748B]">Loading statistics...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-[#D5D4D4] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0F9FF] text-[#2DA8E1]">
                  <FiPieChart className="h-5 w-5" />
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

          <div className="mt-6 rounded-xl border border-[#D5D4D4] bg-white overflow-hidden">
            <div className="border-b border-[#D5D4D4] px-5 py-4 bg-[#F8FAFC]">
              <h2 className="text-lg font-bold text-[#0F1724]">
                Admissions by Branch
              </h2>
            </div>
            <div className="p-5">
              {stats?.byBranch && stats.byBranch.length > 0 ? (
                <div className="space-y-4">
                  {stats.byBranch.map((item) => (
                    <div key={item._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3 last:border-0 last:pb-0">
                      <span className="text-[14px] font-medium text-[#1E293B]">
                        {item._id || "Unassigned"}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 sm:w-48 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#2DA8E1] rounded-full" 
                            style={{ 
                              width: `${Math.min(100, ((item.count || 0) / (stats.admitted || 1)) * 100)}%` 
                            }} 
                          />
                        </div>
                        <span className="text-[14px] font-bold text-[#0F1724] w-8 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#64748B] py-4 text-center">
                  No branch statistics available.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
