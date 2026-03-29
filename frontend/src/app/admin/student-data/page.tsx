"use client";

import { useCallback, useEffect, useState } from "react";
import { FiDownload, FiRefreshCw } from "react-icons/fi";
import { api } from "../../../utils/api";

type StudentRow = {
  id: string;
  name: string;
  email: string;
  program: string;
  branch: string;
  status: string;
  date: string;
};

const STATUS_OPTIONS = [
  "All Statuses",
  "Draft",
  "Submitted",
  "Under Review",
  "Documents Verified",
  "Document Rejected",
  "Payment Pending",
  "Payment Verified",
  "Payment Rejected",
  "Approval Pending",
  "Finalized",
  "Rejected",
  "Withdrawn",
] as const;

const PROGRAM_OPTIONS = [
  "All Programs",
  "BTECH",
  "MBA",
  "MSC",
  "BCA",
  "MCA",
] as const;

function sanitizeText(value: unknown, fallback = "-") {
  const normalized = String(value ?? fallback)
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim();

  return normalized.length > 120 ? normalized.slice(0, 120) : normalized || fallback;
}

function statusClass(status: string): string {
  if (status === "Finalized" || status === "Payment Verified" || status === "Documents Verified") {
    return "bg-[#DCFCE7] text-[#15803D]";
  }

  if (status === "Payment Pending" || status === "Approval Pending" || status === "Under Review") {
    return "bg-[#FFEDD5] text-[#C2410C]";
  }

  if (status === "Rejected" || status === "Document Rejected" || status === "Payment Rejected") {
    return "bg-[#FEE2E2] text-[#B91C1C]";
  }

  return "bg-[#F1F5F9] text-[#475569]";
}

export default function StudentDataPage() {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<(typeof STATUS_OPTIONS)[number]>("All Statuses");
  const [selectedProgram, setSelectedProgram] = useState<(typeof PROGRAM_OPTIONS)[number]>("All Programs");

  const fetchStudentData = useCallback(async () => {
    const safeStatus = STATUS_OPTIONS.includes(selectedStatus) ? selectedStatus : "All Statuses";
    const safeProgram = PROGRAM_OPTIONS.includes(selectedProgram) ? selectedProgram : "All Programs";

    try {
      setError("");
      const response = await api.get("/api/admin/student-data", {
        params: {
          page: 1,
          limit: 100,
          status: safeStatus,
          program: safeProgram,
        },
      });

      const items = Array.isArray(response?.data?.data?.items) ? response.data.data.items : [];
      const mapped = items.map((item: StudentRow) => ({
        id: sanitizeText(item.id),
        name: sanitizeText(item.name),
        email: sanitizeText(item.email),
        program: sanitizeText(item.program).toUpperCase(),
        branch: sanitizeText(item.branch).toUpperCase(),
        status: sanitizeText(item.status),
        date: sanitizeText(item.date),
      }));

      setRows(mapped);
    } catch {
      setError("Failed to load student data.");
      setRows([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [selectedProgram, selectedStatus]);

  useEffect(() => {
    setIsLoading(true);
    fetchStudentData();
  }, [fetchStudentData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudentData();
  };

  const handleExportCsv = () => {
    const header = ["Student Name", "Program", "Branch", "Status", "Date"];
    const body = rows.map((row) => [
      row.name,
      row.program,
      row.branch,
      row.status,
      row.date,
    ]);

    const csv = [header, ...body]
      .map((line) => line.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "student-data.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="w-full space-y-4 [font-family:var(--font-inter)]">
      <div className="flex flex-col gap-3 lg:h-16.25 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-['Times_New_Roman',Times,serif] text-[24px] leading-9 font-bold text-[#0F1724]">Student Data</h1>
          <p className="text-[14px] leading-5.25 text-[#94A3B8]">Manage all student applications</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pb-1">
          <button
            type="button"
            onClick={handleRefresh}
            className="h-9.75 w-33.75 bg-white border border-black/10 rounded-md inline-flex items-center justify-center gap-2 text-[14px] text-[#0F1724]"
          >
            <FiRefreshCw className="text-[16px]" />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="h-9.75 w-37.5 bg-white border border-black/10 rounded-md inline-flex items-center justify-center gap-2 text-[14px] font-medium text-[#0F1724]"
          >
            <FiDownload className="text-[16px]" />
            Export CSV
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-[13px] text-[#B91C1C]">{error}</p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="text-[13px] text-[#64748B] space-y-1.5">
          <span>Status</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as (typeof STATUS_OPTIONS)[number])}
            className="w-full h-11 px-3 rounded-lg bg-white border border-black/10 text-[15px] text-[#0F1724] outline-none focus:ring-2 focus:ring-[#2DA8E1]/30"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="text-[13px] text-[#64748B] space-y-1.5">
          <span>Program</span>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value as (typeof PROGRAM_OPTIONS)[number])}
            className="w-full h-11 px-3 rounded-lg bg-white border border-black/10 text-[15px] text-[#0F1724] outline-none focus:ring-2 focus:ring-[#2DA8E1]/30"
          >
            {PROGRAM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="bg-white border border-black/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-270 border-collapse text-left">
            <thead>
              <tr className="h-12 text-[12px] font-semibold tracking-[0.5px] uppercase text-[#94A3B8]">
                <th className="px-6 border-b border-black/10">Student Name</th>
                <th className="px-6 border-b border-black/10">Program</th>
                <th className="px-6 border-b border-black/10">Branch</th>
                <th className="px-6 border-b border-black/10">Status</th>
                <th className="px-6 border-b border-black/10">Date</th>
                <th className="px-6 border-b border-black/10">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="h-17.5 text-[14px] text-[#0F1724]">
                  <td className="px-6 border-b border-black/10">
                    <div className="leading-4.25 font-medium">{row.name}</div>
                    <div className="text-[13px] leading-4 text-[#94A3B8] mt-1">{row.email}</div>
                  </td>

                  <td className="px-6 border-b border-black/10">
                    <div className="leading-4.25 font-medium">{row.program}</div>
                    <div className="text-[13px] leading-4 text-[#94A3B8] mt-1">{row.branch}</div>
                  </td>

                  <td className="px-6 border-b border-black/10">{row.branch}</td>

                  <td className="px-6 border-b border-black/10">
                    <span
                      className={`inline-flex items-center h-5.75 px-2.5 rounded text-[12px] font-semibold ${statusClass(row.status)}`}
                    >
                      {row.status}
                    </span>
                  </td>

                  <td className="px-6 border-b border-black/10">{row.date}</td>

                  <td className="px-6 border-b border-black/10">
                    <button type="button" className="text-[#2DA8E1] font-medium">
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[14px] text-[#64748B]">
                    No student records match the selected filters.
                  </td>
                </tr>
              )}

              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[14px] text-[#64748B]">
                    Loading student data...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
