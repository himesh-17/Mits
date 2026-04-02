"use client";

import { useMemo } from "react";
import { getAdminData } from "../../lib/AdminStore";
import { FiCheckCircle, FiClock, FiFileText, FiUploadCloud, FiUsers, FiTrendingUp } from "react-icons/fi";
import { useAnimatedNumber } from "./useAnimatedNumber";

type AdminRow = {
  id: string;
  name: string;
  course: string;
  status: string;
  date: string;
};

type StatCardsProps = {
  refresh: boolean;
  metrics?: {
    totalApplications: number;
    uploadedToday: number;
    pendingVerifications: number;
    finalized: number;
    totalEligibleStudents?: number;
    matchedStudents?: number;
    awaitingApplications?: number;
  } | null;
};

export default function StatCards({ refresh, metrics }: StatCardsProps) {
  const stats = useMemo(() => {
    if (metrics) {
      return {
        total: metrics.totalApplications,
        uploadedToday: metrics.uploadedToday,
        pending: metrics.pendingVerifications,
        finalized: metrics.finalized,
        totalEligibleStudents: metrics.totalEligibleStudents || 0,
        matchedStudents: metrics.matchedStudents || 0,
        awaitingApplications: metrics.awaitingApplications || 0,
      };
    }

    const data = getAdminData() as AdminRow[];

    const total = data.length;
    const pending = data.filter((d) => d.status === "pending").length;
    const finalized = data.filter((d) => d.status === "approved").length;

    const today = new Date().toDateString();
    const uploadedToday = data.filter((d) => {
      if (!d.date) return false;
      return new Date(d.date).toDateString() === today;
    }).length;

    return {
      total,
      uploadedToday,
      pending,
      finalized,
      totalEligibleStudents: 0,
      matchedStudents: 0,
      awaitingApplications: 0,
    };
  }, [refresh, metrics]);

  const cards = [
    { title: "TOTAL APPLICATIONS", value: useAnimatedNumber(stats.total), icon: <FiFileText className="text-[#2DA8E1]" /> },
    { title: "UPLOADED TODAY", value: useAnimatedNumber(stats.uploadedToday), icon: <FiUploadCloud className="text-[#2DA8E1]" /> },
    { title: "PENDING VERIFICATIONS", value: useAnimatedNumber(stats.pending), icon: <FiClock className="text-[#2DA8E1]" /> },
    { title: "FINALIZED", value: useAnimatedNumber(stats.finalized), icon: <FiCheckCircle className="text-[#2DA8E1]" /> },
  ];

  const roundsCards = [
    { title: "ELIGIBLE STUDENTS", value: useAnimatedNumber(stats.totalEligibleStudents), icon: <FiUsers className="text-[#10B981]" /> },
    { title: "MATCHED APPLICATIONS", value: useAnimatedNumber(stats.matchedStudents), icon: <FiCheckCircle className="text-[#10B981]" /> },
    { title: "AWAITING APPLICATIONS", value: useAnimatedNumber(stats.awaitingApplications), icon: <FiTrendingUp className="text-[#F59E0B]" /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Applications Section */}
      <div>
        <h3 className="text-sm font-semibold text-[#94A3B8] uppercase mb-3 tracking-[0.45px]">Applications</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {cards.map((item, i) => (
            <div
              key={i}
              className="admin-card-enter admin-soft-card bg-white h-23 px-4 py-3.5 rounded-lg border border-black/10 flex flex-col justify-between"
              style={{ animationDelay: `${80 + i * 45}ms` }}
            >
              <div className="flex items-center gap-2.5">
                <div className="text-[18px] shrink-0">{item.icon}</div>
                <p className="text-[12px] leading-4 tracking-[0.45px] text-[#94A3B8] font-semibold uppercase">
                  {item.title}
                </p>
              </div>

              <div>
                <h2 className="font-['Times_New_Roman',Times,serif] text-[33px] leading-9 font-bold text-[#0F1724]">{item.value}</h2>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admission Rounds Section */}
      <div>
        <h3 className="text-sm font-semibold text-[#94A3B8] uppercase mb-3 tracking-[0.45px]">Admission Rounds</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roundsCards.map((item, i) => (
            <div
              key={i}
              className="admin-card-enter admin-soft-card bg-white h-23 px-4 py-3.5 rounded-lg border border-black/10 flex flex-col justify-between"
              style={{ animationDelay: `${120 + i * 45}ms` }}
            >
              <div className="flex items-center gap-2.5">
                <div className="text-[18px] shrink-0">{item.icon}</div>
                <p className="text-[12px] leading-4 tracking-[0.45px] text-[#94A3B8] font-semibold uppercase">
                  {item.title}
                </p>
              </div>

              <div>
                <h2 className="font-['Times_New_Roman',Times,serif] text-[33px] leading-9 font-bold text-[#0F1724]">{item.value}</h2>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
