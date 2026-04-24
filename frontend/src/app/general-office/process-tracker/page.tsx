"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiDownload,
  FiFilter,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

type ProgressState = "done" | "current" | "upcoming";

interface TrackerRow {
  id: string;
  name: string;
  studentId: string;
  department: string;
  departmentTone: string;
  currentStep: number;
  lastUpdate: string;
}

interface ApiTrackerApplication {
  _id: string;
  fullName?: string;
  programApplied?: string;
  branchDisplayName?: string;
  branch?: string;
  status?: string;
  updatedAt?: string;
}

const progressSteps = ["APP SUB", "DOCS VER", "PAY VER", "APPROVAL"];

function getStepState(stepIndex: number, currentStep: number): ProgressState {
  const stepNumber = stepIndex + 1;
  if (stepNumber < currentStep) return "done";
  if (stepNumber === currentStep) return "current";
  return "upcoming";
}

function StepProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-start gap-0.5 sm:gap-1">
      {progressSteps.map((label, index) => {
        const state = getStepState(index, currentStep);
        const isLast = index === progressSteps.length - 1;

        return (
          <div key={label} className="flex items-start">
            <div className="flex w-17 flex-col items-center sm:w-18">
              <div
                className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border text-[10px] font-semibold leading-none ${
                  state === "done"
                    ? "border-[#2DA8E1] bg-[#2DA8E1] text-white"
                    : state === "current"
                      ? "border-[#2DA8E1] bg-white text-[#2DA8E1]"
                      : "border-[#E2E8F0] bg-white text-[#CBD5E1]"
                }`}
              >
                {state === "done"
                  ? "✓"
                  : state === "current"
                    ? currentStep === 4 && index === 3
                      ? "4"
                      : "✓"
                    : ""}
              </div>
              <span
                className={`mt-1 text-[9px] font-semibold tracking-[0.18em] ${
                  state === "upcoming" ? "text-[#CBD5E1]" : "text-[#2DA8E1]"
                }`}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div className={`mt-2 h-0.5 w-10 sm:w-16 ${index < currentStep - 1 ? "bg-[#2DA8E1]" : "bg-[#E2E8F0]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StudentCell({ row }: { row: TrackerRow }) {
  return (
    <div>
      <p className="text-[14px] font-semibold text-[#0F1724]">{row.name}</p>
      <p className="text-[11px] uppercase tracking-[0.08em] text-[#7B7B7B]">{row.studentId}</p>
    </div>
  );
}

function mapStatusToStep(status?: string): number {
  switch (status) {
    case "submitted":
    case "under_review":
      return 1;
    case "documents_pending":
    case "documents_verified":
    case "re_upload":
      return 2;
    case "payment_pending":
    case "payment_submitted":
    case "payment_verified":
      return 3;
    case "admitted":
      return 4;
    default:
      return 1;
  }
}

function statusToneFromStatus(status?: string): string {
  if (status === "admitted") return "bg-[#DCFCE7] text-[#16A34A]";
  if (status === "under_review" || status === "documents_pending") return "bg-[#FEF3C7] text-[#D97706]";
  return "bg-[#DBEAFE] text-[#2DA8E1]";
}

function formatAgo(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const hours = Math.max(1, Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60)));
  return `${hours}h ago`;
}

export default function GeneralOfficeProcessTrackerPage() {
  const [trackerRows, setTrackerRows] = useState<TrackerRow[]>([]);

  useEffect(() => {
    const fetchTrackerRows = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/general-office/applications?limit=6&page=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load tracker applications");
        }

        const payload = await response.json();
        const mappedRows: TrackerRow[] = (payload.data?.applications || []).map((application: ApiTrackerApplication) => ({
          id: application._id,
          name: application.fullName || "Unknown",
          studentId: `ADM-${String(application._id).slice(-6).toUpperCase()}`,
          department: application.branchDisplayName || application.branch || application.programApplied || "General",
          departmentTone: statusToneFromStatus(application.status),
          currentStep: mapStatusToStep(application.status),
          lastUpdate: formatAgo(application.updatedAt),
        }));

        setTrackerRows(mappedRows);
      } catch (error) {
        console.error("Tracker rows error:", error);
      }
    };

    fetchTrackerRows();
  }, []);

  return (
    <div className="space-y-4 [font-family:var(--font-poppins)]">
      <section className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1
            className="font-[var(--font-poppins)] text-[43px] font-bold leading-none text-[#1E293B]"
          >
            General Office Process Tracker
          </h1>
          <p className="mt-2 text-[14px] leading-5 text-[#7B7B7B]">
            Monitor live progress of student applications through administrative checkpoints.
          </p>
        </div>

        <button className="inline-flex shrink-0 items-center gap-2 rounded-md border border-black/10 bg-white px-4 py-1.5 text-[12px] font-medium text-[#0F1724] shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:bg-[#F8FAFC]">
          <FiDownload className="h-3.5 w-3.5" />
          Export CSV/PDF
        </button>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[#0F1724] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            All Steps
          </button>
          <button className="rounded-md px-4 py-2 text-sm font-medium text-[#9AA4B2] transition hover:bg-white hover:text-[#0F1724]">
            Pending
          </button>
          <button className="rounded-md px-4 py-2 text-sm font-medium text-[#9AA4B2] transition hover:bg-white hover:text-[#0F1724]">
            Approved
          </button>

          <button className="ml-2 inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[#0F1724] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            All Departments
            <FiChevronDown className="h-4 w-4 text-[#7B7B7B]" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[#0F1724] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <FiFilter className="h-4 w-4 text-[#0F1724]" />
            More Filters
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-[#D5D4D4] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="min-w-245 w-full border-collapse">
            <thead>
              <tr className="border-b border-[#D5D4D4] bg-[#F9FAFB] text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9AA4B2]">
                <th className="px-6 py-4">Student Information</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Current Progress Status</th>
                <th className="px-6 py-4">Last Update</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {trackerRows.map((row) => (
                <tr key={row.studentId} className="border-b border-[#D5D4D4] last:border-b-0">
                  <td className="px-6 py-6 align-middle">
                    <StudentCell row={row} />
                  </td>
                  <td className="px-6 py-6 align-middle">
                    <span className={`inline-flex rounded-sm px-3 py-1 text-[11px] font-semibold ${row.departmentTone}`}>
                      {row.department}
                    </span>
                  </td>
                  <td className="px-6 py-6 align-middle">
                    <StepProgress currentStep={row.currentStep} />
                  </td>
                  <td className="px-6 py-6 align-middle text-[13px] text-[#7B7B7B]">
                    {row.lastUpdate}
                  </td>
                  <td className="px-6 py-6 align-middle text-right">
                    <Link href={`/general-office/applications/${row.id}`} className="text-[13px] font-medium text-[#2DA8E1] transition hover:text-[#1F92C0]">
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#D5D4D4] bg-[#F9FAFB] px-6 py-4">
          <p className="text-[13px] text-[#9AA4B2]">Showing 3 of 3 students</p>

          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-sm border border-black/10 bg-white text-[#94A3B8]">
              <FiChevronLeft className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#2DA8E1] bg-[#2DA8E1] text-sm font-medium text-white">
              1
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-sm border border-black/10 bg-white text-[13px] font-medium text-[#94A3B8]">
              2
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-sm border border-black/10 bg-white text-[#94A3B8]">
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
