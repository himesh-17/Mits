"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface DetailRow {
  _id: string;
  fullName?: string;
  email?: string;
  gender?: string;
  category?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  mobile?: string;
  entranceExam?: string;
  branchDisplayName?: string;
  branch?: string;
  programApplied?: string;
  twelfthPercentage?: number;
  twelfthBoard?: string;
  twelfthPassingYear?: number;
  entranceScore?: string;
  status?: string;
}

function badge(label: string) {
  if (label === "Under Review") return "bg-[#FEF3C7] text-[#D97706]";
  if (label === "Finalized") return "bg-[#DCFCE7] text-[#15803D]";
  if (label === "Rejected") return "bg-[#FEE2E2] text-[#DC2626]";
  return "bg-[#FFEEDB] text-[#B45309]";
}

function mapStatus(status?: string) {
  if (status === "under_review") return "Under Review";
  if (status === "documents_verified") return "Finalized";
  if (status === "rejected") return "Rejected";
  return "Payment Pending";
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] text-[#94A3B8]">{label}</p>
      <p className="mt-1 text-[13px] font-semibold text-[#1E293B]">{value || "-"}</p>
    </div>
  );
}

export default function AdmissionCellApplicationDetailPage() {
  const params = useParams<{ applicationId: string }>();
  const applicationId = params?.applicationId;

  const [detail, setDetail] = useState<DetailRow | null>(null);

  useEffect(() => {
    if (!applicationId) return;

    const load = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admission-cell/students/${applicationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Failed to load detail");
        const payload = await response.json();
        setDetail(payload.data?.application || null);
      } catch (error) {
        console.error("Admission cell detail load error:", error);
      }
    };

    load();
  }, [applicationId]);

  const status = useMemo(() => mapStatus(detail?.status), [detail?.status]);

  const handleApprove = async () => {
    if (!applicationId) return;
    try {
      const token = localStorage.getItem("authToken");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admission-cell/applications/${applicationId}/verify`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Approve failed:", error);
    }
  };

  const handleRequestReupload = async () => {
    if (!applicationId) return;
    try {
      const token = localStorage.getItem("authToken");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admission-cell/applications/${applicationId}/send-email`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ remarks: "Please re-upload the required documents." }),
        }
      );
    } catch (error) {
      console.error("Re-upload request failed:", error);
    }
  };

  const handleReject = async () => {
    if (!applicationId) return;
    try {
      const token = localStorage.getItem("authToken");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admission-cell/applications/${applicationId}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: "Rejected by Admission Cell" }),
        }
      );
    } catch (error) {
      console.error("Reject failed:", error);
    }
  };

  return (
    <div className="space-y-3 [font-family:var(--font-poppins)]">
      <section className="flex items-center justify-between">
        <p className="text-[26px] text-[#1E293B]">
          Applications / <span className="font-semibold text-[#2DA8E1]">ADM-TUDENT03</span>
        </p>
        <div className="flex items-center gap-4">
          <p className="text-[36px] font-semibold text-[#1E293B]">{detail?.fullName || "Rahul Verma"}</p>
          <span className={`rounded-sm px-2.5 py-1 text-[11px] font-semibold ${badge(status)}`}>{status}</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-md border border-[#D5D4D4] bg-white">
            <h2 className="border-b border-[#D5D4D4] px-4 py-3 text-[30px] font-bold text-[#1E293B]">Personal Information</h2>
            <div className="grid grid-cols-2 gap-5 px-4 py-4">
              <Info label="Date of Birth" value={detail?.dateOfBirth || "2004-02-08"} />
              <Info label="Gender" value={detail?.gender || "Female"} />
              <Info label="Blood Group" value={detail?.bloodGroup || "O+ Positive"} />
              <Info label="Category" value={detail?.category || "SC"} />
              <Info label="Email Address" value={detail?.email || "student3@gmail.com"} />
              <Info label="Primary Contact" value={detail?.mobile || "9765432109"} />
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-[#D5D4D4] bg-white">
            <h2 className="border-b border-[#D5D4D4] px-4 py-3 text-[30px] font-bold text-[#1E293B]">Academic Information</h2>
            <div className="space-y-3 px-4 py-4">
              <div className="border-b border-[#E5E7EB] pb-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2DA8E1]">Class XII (Senior Secondary)</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[30px] font-bold text-[#1E293B]">{detail?.twelfthBoard || "MP Board"}</p>
                  <p className="text-[34px] font-bold text-[#10B981]">{detail?.twelfthPercentage ? `${detail.twelfthPercentage}%` : "79.4%"}</p>
                </div>
                <p className="text-[12px] text-[#64748B]">Science Stream · Year: {detail?.twelfthPassingYear || "2023"}</p>
              </div>

              <div className="border-b border-[#E5E7EB] pb-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2DA8E1]">Entrance Exam ({detail?.entranceExam || "JEE Main"})</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[30px] font-bold text-[#1E293B]">Score / Rank</p>
                  <p className="text-[34px] font-bold text-[#10B981]">{detail?.entranceScore || "AIR 112"}</p>
                </div>
                <p className="text-[12px] text-[#64748B]">Application Number: --</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2DA8E1]">Program Applied</p>
                <p className="text-[30px] font-bold text-[#1E293B]">{detail?.programApplied || "BTECH"}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2DA8E1]">Branch Applied</p>
                <p className="text-[30px] font-bold text-[#1E293B]">{detail?.branchDisplayName || detail?.branch || "CSE"}</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-[#D5D4D4] bg-white">
            <h2 className="border-b border-[#D5D4D4] px-4 py-3 text-[30px] font-bold text-[#1E293B]">Activity Log</h2>
            <div className="space-y-3 px-4 py-4">
              <p className="text-[12px] text-[#64748B]">No activity recorded</p>
              <div className="border-l-2 border-[#10B981] pl-3">
                <p className="text-[13px] font-semibold text-[#1E293B]">Applied Successfully</p>
                <p className="text-[12px] text-[#64748B]">15 Jul 2024, 05:30 am</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="overflow-hidden rounded-md border border-[#D5D4D4] bg-white">
            <div className="border-b border-[#D5D4D4] px-4 py-3 text-[13px] text-[#64748B]">Status: Select document ⌄</div>
            <div className="flex h-123 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#94A3B8]">📄</div>
                <p className="text-[13px] text-[#64748B]">No documents uploaded yet</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-[#D5D4D4] bg-white px-4 py-3">
            <button onClick={handleApprove} className="rounded-md bg-[#22C55E] px-5 py-2 text-[13px] font-semibold text-white">✓ Approve</button>
            <button onClick={handleRequestReupload} className="rounded-md bg-[#F59E0B] px-5 py-2 text-[13px] font-semibold text-white">↺ Request Re-upload</button>
            <button onClick={handleReject} className="rounded-md border border-[#EF4444] px-5 py-2 text-[13px] font-semibold text-[#EF4444]">⊗ Reject</button>
          </div>

          <div className="flex items-center justify-end gap-3 rounded-md border border-[#D5D4D4] bg-white px-4 py-3">
            <button className="rounded-md bg-[#4B5563] px-6 py-2 text-[13px] font-semibold text-white">◉ Previous</button>
            <button className="rounded-md bg-[#2DA8E1] px-6 py-2 text-[13px] font-semibold text-white">◉ Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}
