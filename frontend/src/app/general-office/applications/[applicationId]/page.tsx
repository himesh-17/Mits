"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiCheckCircle, FiClock, FiDownload } from "react-icons/fi";

type DocumentStatus = "verified" | "pending";

interface DetailDocument {
  label: string;
  status: DocumentStatus;
  fileUrl: string;
  fileName: string;
}

interface DetailData {
  id: string;
  studentId: string;
  status: string;
  roundLabel: string;
  personal: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    category: string;
    domicileState: string;
    nationality: string;
  };
  academic: {
    branch: string;
    rollNo: string;
    twelfthPercent: string;
    entranceExam: string;
    examScore: string;
    priorCollege: string;
  };
  documents: DetailDocument[];
  payment: {
    status: string;
    amount: string;
    method: string;
    transactionId: string;
    paidOn: string;
  };
}

function toTitle(value?: string): string {
  if (!value) return "-";
  return value
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function statusTone(status: string): string {
  if (status === "Admitted") return "bg-[#DCFCE7] text-[#16A34A]";
  if (status === "Rejected") return "bg-[#FEE2E2] text-[#DC2626]";
  return "bg-[#FEF3C7] text-[#D97706]";
}

function docStatusTone(status: DocumentStatus): string {
  return status === "verified"
    ? "bg-[#DCFCE7] text-[#16A34A]"
    : "bg-[#FEF3C7] text-[#D97706]";
}

function mapApiToDetailData(payload: any): DetailData {
  const application = payload?.application || {};
  const personal = payload?.personal || {};
  const academic = payload?.academic || {};
  const payment = payload?.payment || {};
  const documents = Array.isArray(payload?.documents) ? payload.documents : [];

  return {
    id: application.id || "",
    studentId: application.studentId || "-",
    status: toTitle(application.status),
    roundLabel: application.roundLabel || "-",
    personal: {
      fullName: personal.fullName || "-",
      email: personal.email || "-",
      phone: personal.phone || "-",
      dateOfBirth: personal.dateOfBirth || "-",
      gender: personal.gender || "-",
      category: personal.category || "-",
      domicileState: personal.domicileState || "-",
      nationality: personal.nationality || "-",
    },
    academic: {
      branch: academic.branch || "-",
      rollNo: academic.rollNo || "-",
      twelfthPercent: academic.twelfthPercent || "-",
      entranceExam: academic.entranceExam || "-",
      examScore: academic.examScore || "-",
      priorCollege: academic.priorCollege || "-",
    },
    documents: documents.map((doc: any) => ({
      label: doc.label || "Document",
      status: doc.status === "verified" ? "verified" : "pending",
      fileUrl: doc.fileUrl || "",
      fileName: doc.fileName || "file",
    })),
    payment: {
      status: toTitle(payment.status),
      amount: payment.amount || "-",
      method: payment.method || "-",
      transactionId: payment.transactionId || "-",
      paidOn: payment.paidOn || "-",
    },
  };
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#D5D4D4] p-3">
      <p className="text-[11px] text-[#94A3B8]">{label}</p>
      <p className="mt-1 text-[13px] font-semibold text-[#111827] wrap-break-word">{value || "-"}</p>
    </div>
  );
}

export default function GeneralOfficeApplicationDetailPage() {
  const params = useParams<{ applicationId: string }>();
  const applicationId = params?.applicationId;

  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;

    const loadDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/general-office/applications/${applicationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unable to fetch application details");
        }

        const payload = await response.json();
        setData(mapApiToDetailData(payload.data));
      } catch (err) {
        console.error("Application detail error:", err);
        setError("Could not load application details.");
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [applicationId]);

  const statusClass = useMemo(
    () => statusTone(data?.status || "Under Review"),
    [data?.status]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F7FA] p-6 sm:p-8">
        <div className="mx-auto max-w-300 rounded-2xl border border-[#E5E7EB] bg-white p-8">
          <p className="text-[14px] text-[#6B7280]">Loading application details...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#F5F7FA] p-6 sm:p-8">
        <div className="mx-auto max-w-300 rounded-2xl border border-[#E5E7EB] bg-white p-8 space-y-3">
          <p className="text-[14px] font-medium text-[#B91C1C]">{error || "Application not found."}</p>
          <Link
            href="/general-office/applications"
            className="inline-flex items-center gap-2 text-[14px] font-medium text-[#2DA8E1]"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to applications
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-3 py-4 sm:px-4 sm:py-4">
      <div className="mx-auto max-w-300 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#2DA8E1]">
          <Link href="/general-office" className="hover:text-[#2DA8E1]">
            Tracker
          </Link>
          <span>/</span>
          <span className="text-[#2DA8E1]">#{data.studentId}</span>
        </div>

        <div className="rounded-lg border border-[#D5D4D4] bg-transparent p-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="font-['Times_New_Roman',Times,serif] text-[44px] font-bold leading-none text-[#111827]">{data.personal.fullName}</h1>
              <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#6B7280]">
                <span>{data.personal.email}</span>
                <span>•</span>
                <span>{data.academic.branch}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold ${statusClass}`}>
                {data.status}
              </span>
              <span className="inline-flex items-center rounded-full bg-[#DBEAFE] px-3 py-1 text-[12px] font-semibold text-[#2DA8E1]">
                {data.roundLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <section className="rounded-lg border border-[#D5D4D4] bg-white p-4">
              <h2 className="mb-3 text-[14px] font-semibold text-[#111827]">Personal Information</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <InfoRow label="Full Name" value={data.personal.fullName} />
              <InfoRow label="Email" value={data.personal.email} />
              <InfoRow label="Phone Number" value={data.personal.phone} />
              <InfoRow label="Date of Birth" value={data.personal.dateOfBirth} />
              <InfoRow label="Gender" value={data.personal.gender} />
              <InfoRow label="Category" value={data.personal.category} />
              <InfoRow label="Domicile State" value={data.personal.domicileState} />
              <InfoRow label="Nationality" value={data.personal.nationality} />
              </div>
            </section>

            <section className="rounded-lg border border-[#D5D4D4] bg-white p-4">
              <h2 className="mb-3 text-[14px] font-semibold text-[#111827]">Academic Details</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <InfoRow label="Branch Applied" value={data.academic.branch} />
              <InfoRow label="Roll Number" value={data.academic.rollNo} />
              <InfoRow label="12th Percentage" value={data.academic.twelfthPercent} />
              <InfoRow label="Entrance Exam" value={data.academic.entranceExam} />
              <InfoRow label="Exam Score" value={data.academic.examScore} />
              <InfoRow label="Prior College" value={data.academic.priorCollege} />
              </div>
            </section>

            <section className="rounded-lg border border-[#D5D4D4] bg-white p-4">
              <h2 className="mb-3 text-[14px] font-semibold text-[#111827]">Documents ({data.documents.length})</h2>
              <div className="space-y-3">
                {data.documents.length === 0 ? (
                  <p className="text-[14px] text-[#6B7280]">No uploaded documents found.</p>
                ) : (
                  data.documents.map((doc, index) => (
                    <div
                      key={`${doc.label}-${index}`}
                      className="grid grid-cols-1 gap-2 rounded-md border border-[#D5D4D4] p-3 sm:grid-cols-[1fr_auto] sm:items-center"
                    >
                      <div>
                        <p className="text-[11px] text-[#94A3B8]">{doc.label}</p>
                        <p className="mt-1 text-[13px] font-semibold text-[#111827]">{doc.status === "verified" ? "Submitted" : "N/A"}</p>
                      </div>

                      {doc.fileUrl ? (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-md border border-[#D5D4D4] bg-white px-3 py-2 text-[12px] font-medium text-[#2DA8E1] hover:bg-[#F9FAFB]"
                        >
                          <FiDownload className="h-4 w-4" />
                          Open
                        </a>
                      ) : (
                        <span className={`inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-semibold ${docStatusTone(doc.status)}`}>
                          {doc.status === "verified" ? "VERIFIED" : "PENDING"}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-lg border border-[#D5D4D4] bg-white p-4">
              <h2 className="mb-3 text-[14px] font-semibold text-[#111827]">Payment</h2>
              <div className="space-y-2.5 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Current Status</span>
                  <span className="font-medium text-[#111827]">{data.payment.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Amount</span>
                  <span className="font-medium text-[#111827]">{data.payment.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Method</span>
                  <span className="font-medium text-[#111827]">{data.payment.method}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Transaction ID</span>
                  <span className="font-medium text-[#111827] text-right">{data.payment.transactionId || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Paid On</span>
                  <span className="font-medium text-[#111827]">{data.payment.paidOn}</span>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[#D5D4D4] bg-white p-4">
              <h2 className="mb-3 text-[14px] font-semibold text-[#111827]">Quick Actions</h2>
              <div className="space-y-3">
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2DA8E1] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#1F92C0]">
                  <FiCheckCircle className="h-4 w-4" />
                  Mark Documents Verified
                </button>
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#D1D5DB] bg-white px-4 py-2 text-[12px] font-semibold text-[#374151] hover:bg-[#F9FAFB]">
                  <FiClock className="h-4 w-4" />
                  Put On Hold
                </button>
                <Link
                  href="/general-office/applications"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#2DA8E1]/30 bg-[#F0F9FF] px-4 py-2 text-[12px] font-semibold text-[#2DA8E1] hover:bg-[#E0F2FE]"
                >
                  <FiArrowLeft className="h-4 w-4" />
                  Back to Applications
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
