"use client";

import { useMemo } from "react";
import { getAdminData } from "../../lib/AdminStore";
import { FiCheckCircle, FiClock, FiFileText, FiUploadCloud } from "react-icons/fi";

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
    };
  }, [refresh]);

  const cards = [
    { title: "TOTAL APPLICATIONS", value: stats.total, icon: <FiFileText className="text-[#2DA8E1]" /> },
    { title: "UPLOADED TODAY", value: stats.uploadedToday, icon: <FiUploadCloud className="text-[#2DA8E1]" /> },
    { title: "PENDING VERIFICATIONS", value: stats.pending, icon: <FiClock className="text-[#2DA8E1]" /> },
    { title: "FINALIZED", value: stats.finalized, icon: <FiCheckCircle className="text-[#2DA8E1]" /> },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((item, i) => (
        <div
          key={i}
          className="bg-white h-23 px-4 py-3.5 rounded-lg border border-black/10 flex flex-col justify-between"
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
  );
}
