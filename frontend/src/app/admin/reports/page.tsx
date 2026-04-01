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
import { FiBarChart2, FiCheckCircle, FiDownload, FiFileText, FiRefreshCw, FiClock, FiEye, FiXCircle, FiAlertTriangle } from "react-icons/fi";
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
  payment_verified: number;
  application_rejected: number;
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
    payment_verified: 0,
    application_rejected: 0,
    draft: 0,
  },
};

const STATUS_COLORS: Record<string, string> = {
  FINALIZED: "#3B82F6",
  PAYMENT_PENDING: "#8B5CF6",
  PAYMENT_VERIFIED: "#10B981",
  APPLICATION_REJECTED: "#EF4444",
  PAYMENT_REJECTED: "#EF4444",
  DRAFT: "#F59E0B",
};

const DONUT_COLORS = ["#3B82F6", "#8B5CF6", "#EF4444", "#14B8A6"];

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(payload: ReportsPayload) {
  const lines: string[] = [];

  lines.push("Metric,Value");
  lines.push(`${csvEscape("Total Applications")},${csvEscape(payload.cards.totalApplications)}`);
  lines.push(`${csvEscape("Finalized")},${csvEscape(payload.cards.finalized)}`);
  lines.push(`${csvEscape("Conversion Rate")},${csvEscape(`${payload.cards.conversionRate}%`)}`);
  lines.push(`${csvEscape("Revenue")},${csvEscape(payload.cards.revenue)}`);
  lines.push("");

  lines.push("Applications Over Time");
  lines.push("Month,Applications");
  payload.applicationsOverTime.forEach((row) => {
    lines.push(`${csvEscape(row.label)},${csvEscape(row.applications)}`);
  });
  lines.push("");

  lines.push("Applications By Program");
  lines.push("Program,Applications");
  payload.programDistribution.forEach((row) => {
    lines.push(`${csvEscape(row.program)},${csvEscape(row.applications)}`);
  });
  lines.push("");

  lines.push("Category Distribution");
  lines.push("Category,Applications");
  payload.categoryDistribution.forEach((row) => {
    lines.push(`${csvEscape(row.category)},${csvEscape(row.value)}`);
  });
  lines.push("");

  lines.push("Application Status Breakdown");
  lines.push("Status,Applications");
  lines.push(`${csvEscape("FINALIZED")},${csvEscape(payload.statusBreakdown.finalized)}`);
  lines.push(`${csvEscape("PAYMENT_PENDING")},${csvEscape(payload.statusBreakdown.payment_pending)}`);
  lines.push(`${csvEscape("PAYMENT_VERIFIED")},${csvEscape(payload.statusBreakdown.payment_verified)}`);
  lines.push(`${csvEscape("APPLICATION_REJECTED")},${csvEscape(payload.statusBreakdown.application_rejected)}`);
  lines.push(`${csvEscape("DRAFT")},${csvEscape(payload.statusBreakdown.draft)}`);

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
      { name: "PAYMENT_VERIFIED", value: reports.statusBreakdown.payment_verified },
      { name: "APPLICATION_REJECTED", value: reports.statusBreakdown.application_rejected },
      { name: "DRAFT", value: reports.statusBreakdown.draft },
    ],
    [reports.statusBreakdown],
  );

  const maxStatusValue = Math.max(1, ...statusRows.map((row) => row.value));

  return (
    <section className="admin-section-enter w-full space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-['Times_New_Roman',Times,serif] text-[38px] leading-none font-bold text-[#0F1724]">
            Admission Cell Reports
          </h1>
          <p className="mt-2 text-[15px] text-[#8A98A8]">Verification workload & activity overview</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-10 px-6 rounded-lg border border-black/10 bg-white text-[14px] font-bold text-[#0F1724] flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FiRefreshCw className="text-[16px]" />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => downloadCsv(reports)}
            className="h-10 px-6 rounded-lg bg-[#2DA8E1] text-[14px] font-bold text-white shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-[#1D91C8] transition-colors"
          >
            <FiDownload className="text-[16px]" />
            Export CSV
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-[#B45309] font-medium">{error}</p> : null}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <SummaryCard
          title="Awaiting Review"
          value={String(reports.statusBreakdown.draft)}
          icon={<FiClock className="text-[#8B5CF6]" />}
          iconBg="#F5F3FF"
        />
        <SummaryCard
          title="Under Review"
          value={String(reports.statusBreakdown.payment_pending)}
          icon={<FiEye className="text-[#3B82F6]" />}
          iconBg="#EFF6FF"
        />
        <SummaryCard
          title="Docs Verified"
          value={String(reports.statusBreakdown.payment_verified)}
          icon={<FiCheckCircle className="text-[#10B981]" />}
          iconBg="#ECFDF5"
        />
        <SummaryCard
          title="Docs Rejected"
          value={String(reports.statusBreakdown.application_rejected)}
          icon={<FiXCircle className="text-[#EF4444]" />}
          iconBg="#FEF2F2"
        />
        <SummaryCard
          title="Rejected Total"
          value={String(reports.statusBreakdown.application_rejected)}
          icon={<FiAlertTriangle className="text-[#991B1B]" />}
          iconBg="#FEF2F2"
        />
      </div>

      <div className="space-y-8">
        {/* Verification Pipeline */}
        <div className="bg-white rounded-xl border border-black/[0.05] p-8 shadow-sm h-full">
          <h2 className="text-[18px] font-bold text-[#0F1724] mb-8">Verification Pipeline</h2>
          <div className="space-y-8">
            <PipelineBar label="Submitted (Pending Review)" value={reports.statusBreakdown.draft} total={reports.cards.totalApplications || 1} color="#E2E8F0" />
            <PipelineBar label="Under Review" value={reports.statusBreakdown.payment_pending} total={reports.cards.totalApplications || 1} color="#3B82F6" />
            <PipelineBar label="Documents Verified" value={reports.statusBreakdown.payment_verified} total={reports.cards.totalApplications || 1} color="#E2E8F0" />
            <PipelineBar label="Documents Rejected" value={reports.statusBreakdown.application_rejected} total={reports.cards.totalApplications || 1} color="#E2E8F0" />

            <div className="pt-6 flex items-center justify-between border-t border-black/[0.03]">
              <p className="text-[14px] font-medium text-[#8A98A8]">Avg. Review Time</p>
              <p className="text-[15px] font-bold text-[#0F1724]">2.3 days</p>
            </div>
          </div>
        </div>

        {/* Admission Cell Breakdown */}
        <div className="bg-white rounded-xl border border-black/[0.05] p-8 shadow-sm h-full">
          <h2 className="text-[18px] font-bold text-[#0F1724] mb-8">Admission Cell Breakdown</h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Under Review", value: reports.statusBreakdown.payment_pending, color: "#3B82F6" },
                  { name: "Awaiting Review", value: reports.statusBreakdown.draft, color: "#8B5CF6" },
                  { name: "Docs Verified", value: reports.statusBreakdown.payment_verified, color: "#10B981" },
                  { name: "Docs Rejected", value: reports.statusBreakdown.application_rejected, color: "#EF4444" },
                  { name: "Withdrawal", value: 0, color: "#F59E0B" },
                  { name: "Total Rejected", value: reports.statusBreakdown.application_rejected, color: "#1A1A1A" },
                ]}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                barSize={32}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 13, fontWeight: 500 }}
                  width={140}
                />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {
                    [
                      { color: "#3B82F6" },
                      { color: "#8B5CF6" },
                      { color: "#10B981" },
                      { color: "#EF4444" },
                      { color: "#F59E0B" },
                      { color: "#1A1A1A" },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {isLoading ? <p className="text-sm text-[#64748B] italic">Refreshing data...</p> : null}
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
    <article className="bg-white rounded-xl border border-black/[0.05] p-6 shadow-sm flex flex-col items-start gap-4 transition-all hover:shadow-md group">
      <div
        className="h-10 w-10 items-center justify-center rounded-lg flex shrink-0 group-hover:scale-110 transition-transform"
        style={{ backgroundColor: iconBg }}
      >
        <span className="text-[20px]">{icon}</span>
      </div>
      <div>
        <p className="text-[32px] font-bold text-[#0F1724] leading-tight mb-1">{value}</p>
        <p className="text-[13px] font-bold text-[#94A3B8] uppercase tracking-[0.5px]">{title}</p>
      </div>
    </article>
  );
}

function PipelineBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percent = total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <p className="text-[14px] font-semibold text-[#64748B]">{label}</p>
        <p className="text-[15px] font-bold text-[#0F1724]">{value}</p>
      </div>
      <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(0,0,0,0.05)]"
          style={{ width: `${percent > 0 ? percent : 2}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
