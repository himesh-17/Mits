"use client";

import { useEffect, useState } from "react";
import { getAdminData } from "../../lib/AdminStore";

export default function StatCards({ refresh }: any) {
  const [stats, setStats] = useState({
    total: 0,
    uploadedToday: 0,
    pending: 0,
    finalized: 0,
  });

  useEffect(() => {
    const data = getAdminData();

    const total = data.length;

    const pending = data.filter((d) => d.status === "pending").length;

    const finalized = data.filter((d) => d.status === "approved").length;

    // 📅 Uploaded Today logic
    const today = new Date().toDateString();
    const uploadedToday = data.filter((d) => {
      if (!d.date) return false;
      return new Date(d.date).toDateString() === today;
    }).length;

    setStats({
      total,
      uploadedToday,
      pending,
      finalized,
    });
  }, [refresh]);

  const cards = [
    { title: "TOTAL APPLICATIONS", value: stats.total },
    { title: "UPLOADED TODAY", value: stats.uploadedToday },
    { title: "PENDING VERIFICATIONS", value: stats.pending },
    { title: "FINALIZED", value: stats.finalized },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 rounded-lg">
      {cards.map((item, i) => (
        <div key={i} className="bg-white p-4 rounded-lg border">
          <p className="text-xs text-gray-500">{item.title}</p>
          <h2 className="text-2xl font-semibold">{item.value}</h2>
        </div>
      ))}
    </div>
  );
}
