"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiChevronRight, FiDownload } from "react-icons/fi";

interface ApplicationRow {
  id: string;
  applicant: string;
  email: string;
  program: string;
  branch: string;
  round: string;
  paymentLabel: string;
  paymentAmount: string;
  statusLabel: string;
  statusTone: string;
  updated: string;
}

interface ApiApplicationRow {
  _id: string;
  fullName?: string;
  email?: string;
  programApplied?: string;
  branch?: string;
  branchDisplayName?: string;
  allottedRound?: string;
  status?: string;
  updatedAt?: string;
  payment?: {
    status: string;
    amount: number;
    paymentMode?: string;
  } | null;
}

const statusToneMap: Record<string, string> = {
  "Payment Pending": "bg-[#FFEEDB] text-[#B45309]",
  "Under Review": "text-[#B45309]",
  Finalized: "bg-[#DCFCE7] text-[#166534]",
};

function formatCurrency(amount = 0) {
  if (!amount) return "";
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date).replace(",", "");
}

function StatusPill({ label, tone }: { label: string; tone: string }) {
  if (!tone.includes("bg-")) {
    return <span className={`text-[13px] font-semibold ${tone}`}>{label}</span>;
  }

  return (
    <span className={`inline-flex rounded-sm px-3 py-1 text-[12px] font-semibold ${tone}`}>
      {label}
    </span>
  );
}

export default function GeneralOfficeApplicationsPage() {
  const [applicationRows, setApplicationRows] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/general-office/applications?limit=3&page=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load applications");
        }

        const payload = await response.json();
        const rows: ApplicationRow[] = (payload.data?.applications || []).map((application: ApiApplicationRow) => {
          const statusLabel =
            application.status === "admitted"
              ? "Finalized"
              : application.status === "payment_pending" || application.status === "payment_submitted"
                ? "Payment Pending"
                : "Under Review";

          const paymentStatus =
            application.payment?.status === "verified"
              ? "VERIFIED"
              : application.payment?.status === "submitted"
                ? "SUBMITTED"
                : application.payment?.status === "pending"
                  ? "PENDING"
                  : application.payment?.status === "rejected"
                    ? "REJECTED"
                    : "None";

          return {
            id: application._id,
            applicant: application.fullName || "Unknown",
            email: application.email || "",
            program: application.programApplied || "",
            branch: application.branchDisplayName || application.branch || "",
            round: application.allottedRound || "Admission Round 2024-25",
            paymentLabel: paymentStatus,
            paymentAmount: formatCurrency(application.payment?.amount || 0),
            statusLabel,
            statusTone: statusToneMap[statusLabel],
            updated: formatDate(application.updatedAt),
          };
        });

        setApplicationRows(rows);
      } catch (error) {
        console.error("Applications load error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const pendingCount = useMemo(
    () => applicationRows.filter((row) => row.statusLabel === "Payment Pending" || row.statusLabel === "Under Review").length,
    [applicationRows]
  );

  return (
    <div className="space-y-4 [font-family:var(--font-poppins)]">
      <section className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1
            className="font-[var(--font-poppins)] text-[43px] font-bold leading-none text-[#1A1B1E]"
          >
            All Applications
          </h1>
          <p className="mt-1 text-[14px] leading-5 text-[#7B7B7B]">
            {applicationRows.length} total · {pendingCount} pending your approval
          </p>
        </div>

        <button className="inline-flex shrink-0 items-center gap-2 rounded-md border border-black/10 bg-white px-4 py-1.5 text-[12px] font-medium text-[#4B5563] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition hover:bg-[#F8FAFC]">
          <FiDownload className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </section>

      <section className="overflow-hidden rounded-md border border-black/10 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="min-w-263.75 w-full border-collapse">
            <thead>
              <tr className="border-b border-black/10 text-left text-[12px] font-semibold uppercase tracking-[0.06em] text-[#7B7B7B]">
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Program / Branch</th>
                <th className="px-6 py-4">Round</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Updated</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && applicationRows.length === 0 ? (
                [...Array(3)].map((_, index) => (
                  <tr key={index} className="border-b border-black/10 last:border-b-0">
                    <td className="px-6 py-5 text-sm text-[#7B7B7B]" colSpan={7}>
                      Loading applications...
                    </td>
                  </tr>
                ))
              ) : applicationRows.length > 0 ? (
                applicationRows.map((row) => (
                  <tr key={row.id} className="border-b border-black/10 last:border-b-0">
                    <td className="px-6 py-5 align-middle">
                      <div>
                        <p className="text-[14px] font-medium text-[#1A1B1E]">{row.applicant}</p>
                        <p className="mt-1 text-[13px] text-[#7B7B7B]">{row.email}</p>
                      </div>
                    </td>

                    <td className="px-6 py-5 align-middle">
                      <div>
                        <p className="text-[14px] font-medium uppercase text-[#1A1B1E]">{row.program}</p>
                        <p className="mt-1 text-[13px] text-[#7B7B7B]">{row.branch}</p>
                      </div>
                    </td>

                    <td className="px-6 py-5 align-middle">
                      <p className="text-[13px] leading-5 text-[#7B7B7B]">{row.round}</p>
                    </td>

                    <td className="px-6 py-5 align-middle">
                      <div>
                        <p className="text-[12px] font-semibold tracking-[0.06em] text-[#D97706]">
                          {row.paymentLabel}
                        </p>
                        {row.paymentAmount ? (
                          <p className="mt-1 text-[13px] text-[#7B7B7B]">{row.paymentAmount}</p>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-6 py-5 align-middle">
                      <StatusPill label={row.statusLabel} tone={row.statusTone} />
                    </td>

                    <td className="px-6 py-5 align-middle">
                      <p className="text-[13px] leading-5 text-[#7B7B7B]">{row.updated}</p>
                    </td>

                    <td className="px-6 py-5 align-middle text-right">
                      <Link href={`/general-office/applications/${row.id}`} className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#2F6FE0] transition hover:text-[#1F56B5]">
                        View
                        <FiChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-black/10 last:border-b-0">
                  <td className="px-6 py-8 text-sm text-[#7B7B7B]" colSpan={7}>
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
