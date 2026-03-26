"use client";

import { useEffect, useState } from "react";
import { getAdminData } from "../../lib/AdminStore";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
export default function Charts({ refresh }: any) {
  const [stats, setStats] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
    draft: 0,
    total: 0,
  });

  useEffect(() => {
    const data = getAdminData();

    const approved = data.filter((d) => d.status === "approved").length;
    const pending = data.filter((d) => d.status === "pending").length;
    const rejected = data.filter((d) => d.status === "rejected").length;
    const draft = data.filter((d) => d.status === "draft").length;

    setStats({
      approved,
      pending,
      rejected,
      draft,
      total: data.length,
    });
  }, [refresh]);

  // 🔥 Pie Data
  const pieData = [
    { name: "Approved", value: stats.approved },
    { name: "Pending", value: stats.pending },
    { name: "Rejected", value: stats.rejected },
    { name: "Draft", value: stats.draft },
  ];

const COLORS = ["#4F46E5", "#8B5CF6", "#E5E7EB", "#CBD5F5"];
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* 🔵 REAL PIE CHART */}
      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold mb-4">Application Distribution</h2>

        <div className="h-60 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={60} // 🔥 donut effect
                outerRadius={90}
                paddingAngle={3}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Label */}  
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Applications</p>
              <h2 className="text-2xl font-semibold">{stats.total}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 Status Breakdown */}
      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold mb-4">Status Breakdown</h2>

        <Progress label="Finalized" value={stats.approved} />
        <Progress label="Pending" value={stats.pending} />
        <Progress label="Rejected" value={stats.rejected} />
        <Progress label="Draft" value={stats.draft} />
      </div>
    </div>
  );
}

function Progress({ label, value }: any) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded">
        <div
          className="h-2 bg-green-500 rounded"
          style={{ width: `${value * 20}%` }}
        />
      </div>
    </div>
  );
}
