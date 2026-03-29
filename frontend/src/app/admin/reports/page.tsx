"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiBarChart2, FiCheckCircle, FiDownload, FiFileText } from "react-icons/fi";
import { api } from "../../../utils/api";

type ReportCardData = {
  totalApplications: number;
  finalized: number;
  conversionRate: number;
  revenue: number;
};

type TimelinePoint = {
  key: string;
  label: string;
  applications: number;
};

type ProgramPoint = {
  program: string;
  applications: number;
};

type CategoryPoint = {
  category: string;
  value: number;
};

type StatusBreakdown = {
  finalized: number;
  payment_pending: number;
  payment_rejected: number;
  draft: number;
};

type ReportsPayload = {
  cards: ReportCardData;
  applicationsOverTime: TimelinePoint[];
  programDistribution: ProgramPoint[];
  categoryDistribution: CategoryPoint[];
  statusBreakdown: StatusBreakdown;
};

const FALLBACK_DATA: ReportsPayload = {
  cards: {
    totalApplications: 0,
    finalized: 0,
    conversionRate: 0,
    revenue: 0,
  },
  applicationsOverTime: [],
  programDistribution: [],
  categoryDistribution: [
    { category: "GENERAL", value: 0 },
    { category: "OBC", value: 0 },
    { category: "SC", value: 0 },
  ],
  statusBreakdown: {
    finalized: 0,
    payment_pending: 0,
    payment_rejected: 0,
    draft: 0,
  },
};

const STATUS_COLORS: Record<string, string> = {
  FINALIZED: "#3B82F6",
  PAYMENT_PENDING: "#8B5CF6",
  PAYMENT_REJECTED: "#10B981",
  DRAFT: "#F59E0B",
};

const DONUT_COLORS = ["#3B82F6", "#8B5CF6", "#EF4444", "#14B8A6"];

function downloadCsv(payload: ReportsPayload) {
  const lines: string[] = [];

  lines.push("Metric,Value");
  lines.push(`Total Applications,${payload.cards.totalApplications}`);
  lines.push(`Finalized,${payload.cards.finalized}`);
  lines.push(`Conversion Rate,${payload.cards.conversionRate}%`);
  lines.push(`Revenue,${payload.cards.revenue}`);
  lines.push("");

  lines.push("Applications Over Time");
  lines.push("Month,Applications");
  payload.applicationsOverTime.forEach((row) => {
    lines.push(`${row.label},${row.applications}`);
  });
  lines.push("");

  lines.push("Applications By Program");
  lines.push("Program,Applications");
  payload.programDistribution.forEach((row) => {
    lines.push(`${row.program},${row.applications}`);
  });
  lines.push("");

  lines.push("Category Distribution");
  lines.push("Category,Applications");
  payload.categoryDistribution.forEach((row) => {
    lines.push(`${row.category},${row.value}`);
  });
  lines.push("");

  lines.push("Application Status Breakdown");
  lines.push("Status,Applications");
  lines.push(`FINALIZED,${payload.statusBreakdown.finalized}`);
  lines.push(`PAYMENT_PENDING,${payload.statusBreakdown.payment_pending}`);
  lines.push(`PAYMENT_REJECTED,${payload.statusBreakdown.payment_rejected}`);
  lines.push(`DRAFT,${payload.statusBreakdown.draft}`);

  const csvContent = lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "admin-reports.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportsPayload>(FALLBACK_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReports() {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get("/api/admin/reports");
        const payload = response?.data?.data;

        if (payload?.cards) {
          setReports({
            cards: payload.cards,
            applicationsOverTime: Array.isArray(payload.applicationsOverTime) ? payload.applicationsOverTime : [],
            programDistribution: Array.isArray(payload.programDistribution) ? payload.programDistribution : [],
            categoryDistribution: Array.isArray(payload.categoryDistribution) ? payload.categoryDistribution : [],
            statusBreakdown: payload.statusBreakdown || FALLBACK_DATA.statusBreakdown,
          });
          return;
        }

        setReports(FALLBACK_DATA);
      } catch {
        setError("Failed to load reports from backend. Showing empty analytics.");
        setReports(FALLBACK_DATA);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReports();
  }, []);

  const categoryChart = useMemo(() => {
    if (reports.categoryDistribution.length > 0) {
      return reports.categoryDistribution;
    }
    return FALLBACK_DATA.categoryDistribution;
  }, [reports.categoryDistribution]);

  const statusRows = useMemo(
    () => [
      { name: "FINALIZED", value: reports.statusBreakdown.finalized },
      { name: "PAYMENT_PENDING", value: reports.statusBreakdown.payment_pending },
      { name: "PAYMENT_REJECTED", value: reports.statusBreakdown.payment_rejected },
      { name: "DRAFT", value: reports.statusBreakdown.draft },
    ],
    [reports.statusBreakdown],
  );

  const maxStatusValue = Math.max(1, ...statusRows.map((row) => row.value));

  return (
    <section className="w-full max-w-300 space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-['Times_New_Roman',Times,serif] text-[38px] leading-none font-bold text-[#0F1724]">
            Reports &amp; Analytics
          </h1>
          <p className="mt-2 text-[15px] text-[#8A98A8]">Comprehensive admission cycle insights</p>
        </div>

        <button
          type="button"
          onClick={() => downloadCsv(reports)}
          className="h-9.5 w-fit rounded-lg border border-black/10 bg-white px-4 text-[14px] font-medium text-[#0F1724] shadow-[0_1px_2px_rgba(0,0,0,0.05)] inline-flex items-center gap-2"
        >
          <FiDownload size={14} />
          Export CSV
        </button>
      </div>

      {error ? <p className="text-sm text-[#B45309]">{error}</p> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Total Applications"
          value={String(reports.cards.totalApplications)}
          icon={<FiFileText className="text-[#3B82F6]" />}
          iconBg="#EFF6FF"
        />
        <SummaryCard
          title="Finalized"
          value={String(reports.cards.finalized)}
          icon={<FiCheckCircle className="text-[#10B981]" />}
          iconBg="#ECFDF5"
        />
        <SummaryCard
          title="Conversion Rate"
          value={`${reports.cards.conversionRate}%`}
          icon={<FiBarChart2 className="text-[#8B5CF6]" />}
          iconBg="#F5F3FF"
        />
      </div>

      <div className="rounded-md border border-black/10 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] md:p-8">
        <h2 className="font-['Times_New_Roman',Times,serif] text-[24px] font-bold text-[#0F1724]">Applications Over Time</h2>

        <div className="mt-6 h-75 w-full md:h-85">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reports.applicationsOverTime} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
              <XAxis dataKey="label" stroke="#8A98A8" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis stroke="#8A98A8" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="#3B82F6"
                strokeWidth={4}
                dot={{ r: 4, strokeWidth: 2, fill: "#3B82F6", stroke: "#FFFFFF" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-md border border-black/10 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] md:p-8">
          <h2 className="font-['Times_New_Roman',Times,serif] text-[24px] font-bold text-[#0F1724]">Applications by Program</h2>

          <div className="mt-6 h-65 w-full md:h-75">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports.programDistribution} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
                <XAxis dataKey="program" stroke="#8A98A8" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#8A98A8" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="applications" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={120} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-md border border-black/10 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] md:p-8">
          <h2 className="font-['Times_New_Roman',Times,serif] text-[24px] font-bold text-[#0F1724]">Category Distribution</h2>

          <div className="mt-6 flex h-65 flex-col items-center justify-center gap-6 md:h-75">
            <div className="h-45 w-45">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChart}
                    dataKey="value"
                    nameKey="category"
                    innerRadius={58}
                    outerRadius={86}
                    stroke="none"
                    paddingAngle={2}
                  >
                    {categoryChart.map((entry, index) => (
                      <Cell key={entry.category} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {categoryChart.map((entry, index) => (
                <div key={entry.category} className="inline-flex items-center gap-2 text-[12px] text-[#8A98A8]">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                  />
                  <span>{entry.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-black/10 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] md:p-8">
        <h2 className="font-['Times_New_Roman',Times,serif] text-[24px] font-bold text-[#0F1724]">Application Status Breakdown</h2>

        <div className="mt-6 h-70 w-full md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={statusRows}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 20, bottom: 0 }}
              barSize={28}
            >
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" horizontal={false} />
              <XAxis
                type="number"
                stroke="#8A98A8"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, maxStatusValue]}
                allowDecimals={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#1F2937"
                tick={{ fontSize: 11, fontWeight: 700 }}
                tickLine={false}
                axisLine={false}
                width={140}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                {statusRows.map((row) => (
                  <Cell key={row.name} fill={STATUS_COLORS[row.name] || "#3B82F6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {isLoading ? <p className="text-sm text-[#64748B]">Loading reports...</p> : null}
    </section>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  iconBg,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <article className="rounded-md border border-black/10 bg-white px-6 py-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div
        className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[10px]"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <p className="font-['Times_New_Roman',Times,serif] text-[34px] leading-8 font-bold text-[#0F1724]">{value}</p>
      <p className="mt-2 text-[13px] font-medium text-[#8A98A8]">{title}</p>
    </article>
  );
}
