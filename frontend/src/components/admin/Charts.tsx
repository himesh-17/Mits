"use client";

import { useMemo } from "react";
import { getAdminData } from "../../lib/AdminStore";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAnimatedNumber } from "./useAnimatedNumber";
type AdminRow = {
  status: string;
};

type ChartsProps = {
  refresh: boolean;
  breakdown?: {
    finalized: number;
    pending: number;
    rejected: number;
    draft: number;
    total: number;
  } | null;
};

export default function Charts({ refresh, breakdown }: ChartsProps) {
  const stats = useMemo(() => {
    if (breakdown) {
      return {
        finalized: breakdown.finalized,
        pending: breakdown.pending,
        rejected: breakdown.rejected,
        draft: breakdown.draft,
        total: breakdown.total,
      };
    }

    const data = getAdminData() as AdminRow[];

    const finalized = data.filter((d) => d.status === "approved").length;
    const pending = data.filter((d) => d.status === "pending").length;
    const rejected = data.filter((d) => d.status === "rejected").length;
    const draft = data.filter((d) => d.status === "draft").length;

    return {
      finalized,
      pending,
      rejected,
      draft,
      total: data.length,
    };
  }, [refresh, breakdown]);

  const pieData = [
    { name: "Finalized", value: stats.finalized, color: "#2DA8E1" },
    { name: "Pending", value: stats.pending, color: "#F59E0B" },
    { name: "Rejected", value: stats.rejected, color: "#EF4444" },
    { name: "Draft", value: stats.draft, color: "#94A3B8" },
  ];

  const animatedTotal = useAnimatedNumber(stats.total);
  const animatedFinalized = useAnimatedNumber(stats.finalized);
  const animatedPending = useAnimatedNumber(stats.pending);
  const animatedRejected = useAnimatedNumber(stats.rejected);
  const animatedDraft = useAnimatedNumber(stats.draft);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg border border-black/10">
        <div className="h-11 px-4 border-b border-black/10 flex items-center">
          <h2 className="font-[var(--font-poppins)] text-[16px] leading-6 font-bold text-[#0F1724]">Application Distribution</h2>
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-[1fr_170px] gap-3 items-center">
          <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={56}
                  outerRadius={84}
                  paddingAngle={2}
                  stroke="none"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-[0.4px] text-[#94A3B8] font-semibold">
                  Total
                </p>
                <h3 className="font-[var(--font-poppins)] text-[34px] leading-9 font-bold text-[#0F1724]">{animatedTotal}</h3>
              </div>
            </div>
          </div>

          <div className="space-y-3 pr-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[12px] text-[#334155]">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold text-[#0F1724]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-black/10">
        <div className="h-11 px-4 border-b border-black/10 flex items-center">
          <h2 className="font-[var(--font-poppins)] text-[16px] leading-6 font-bold text-[#0F1724]">Status Breakdown</h2>
        </div>

        <div className="p-4 space-y-4">
          <Progress label="Finalized" value={animatedFinalized} total={stats.total} color="#2DA8E1" />
          <Progress label="Pending" value={animatedPending} total={stats.total} color="#F59E0B" />
          <Progress label="Rejected" value={animatedRejected} total={stats.total} color="#EF4444" />
          <Progress label="Draft" value={animatedDraft} total={stats.total} color="#94A3B8" />
        </div>
      </div>
    </div>
  );
}

type ProgressProps = {
  label: string;
  value: number;
  total: number;
  color: string;
};

function Progress({ label, value, total, color }: ProgressProps) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between text-[13px] mb-1.5">
        <span className="text-[#334155] font-medium">{label}</span>
        <span className="text-[#0F1724] font-semibold">
          {value} ({percent}%)
        </span>
      </div>

      <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
        <div
          className="admin-progress-fill h-2 rounded-full"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
