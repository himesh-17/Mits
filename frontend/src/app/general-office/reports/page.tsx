"use client";

import { useState, useEffect } from "react";
import { FiDownload } from "react-icons/fi";
import ReportsStats from "../../../components/general-office/ReportsStats";
import BranchwiseSummary from "../../../components/general-office/BranchwiseSummary";
import ApplicationStatusBreakdown from "../../../components/general-office/ApplicationStatusBreakdown";
import RecentlyFinalizedAdmissions from "../../../components/general-office/RecentlyFinalizedAdmissions";

interface ReportsData {
  totalApplications: number;
  finalized: number;
  awaitingApproval: number;
  revenueCollected: string;
  branchSummary: Array<{
    name: string;
    finalized: number;
    total: number;
    revenue: string;
  }>;
  statusBreakdown: {
    paymentPending: number;
    underReview: number;
    finalized: number;
  };
  recentlyFinalized: Array<{
    id: string;
    name: string;
    date: string;
  }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData>({
    totalApplications: 3,
    finalized: 1,
    awaitingApproval: 0,
    revenueCollected: "₹0.3L",
    branchSummary: [
      { name: "Computer Applications", finalized: 0, total: 1, revenue: "₹0K" },
      { name: "Electronics", finalized: 0, total: 1, revenue: "₹0K" },
      { name: "Computer Science", finalized: 1, total: 1, revenue: "₹25K" },
    ],
    statusBreakdown: {
      paymentPending: 1,
      underReview: 1,
      finalized: 1,
    },
    recentlyFinalized: [
      { id: "1", name: "Priya Sharma", date: "25 Jul 2024, 06:30 am" },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/general-office/reports`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          setData(result.data);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching reports data:", err);
        setError(null); // Use default data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, []);

  return (
    <div className="space-y-4 [font-family:var(--font-poppins)]">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            className="font-[var(--font-poppins)] text-[43px] font-bold leading-none text-[#0F1724]"
          >
            Reports & Analytics
          </h1>
          <p className="mt-2 text-[14px] text-[#6B7280]">
            Institution-wide admission process overview
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-md border border-[#D5D4D4] bg-white px-4 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:bg-[#F9FAFB]">
          <FiDownload className="h-3.5 w-3.5 text-[#0F1724]" />
          <span className="text-[12px] font-semibold text-[#0F1724]">Export Full CSV</span>
        </button>
      </section>

      <ReportsStats data={data} loading={loading} />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BranchwiseSummary branchData={data.branchSummary} />
        </div>

        <div className="lg:col-span-1">
          <ApplicationStatusBreakdown statusData={data.statusBreakdown} />
        </div>
      </section>

      <RecentlyFinalizedAdmissions admissions={data.recentlyFinalized} />
    </div>
  );
}
