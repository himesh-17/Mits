"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiMoreVertical } from "react-icons/fi";

interface Application {
  _id: string;
  studentId: string;
  name: string;
  email: string;
  branch: string;
  course: string;
  documentCount: number;
  status: "pending" | "under_review" | "approved" | "rejected";
  submissionDate: string;
}

interface ApiApplication {
  _id: string;
  fullName?: string;
  email?: string;
  branchDisplayName?: string;
  branch?: string;
  programApplied?: string;
  status?: string;
  documents?: Record<string, unknown>;
  submittedAt?: string;
}

function normalizeStatus(status?: string): Application["status"] {
  if (status === "admitted" || status === "payment_verified") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "under_review") return "under_review";
  return "pending";
}

interface VerificationApplicationsTableProps {
  loading?: boolean;
  error?: string | null;
  onReview?: (applicationId: string) => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<
    string,
    { bg: string; text: string; label: string }
  > = {
    pending: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      label: "Pending",
    },
    under_review: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      label: "Under Review",
    },
    approved: {
      bg: "bg-green-50",
      text: "text-green-700",
      label: "Approved",
    },
    rejected: {
      bg: "bg-red-50",
      text: "text-red-700",
      label: "Rejected",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default function VerificationApplicationsTable({
  loading = false,
  error = null,
  onReview,
}: VerificationApplicationsTableProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(loading);
  const [isError, setIsError] = useState(error);

  const limit = 10;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/general-office/applications?page=${currentPage}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }

        const data = await response.json();
        const mappedApplications: Application[] = (data.data?.applications || []).map((app: ApiApplication) => ({
          _id: app._id,
          studentId: `ADM-${String(app._id).slice(-6).toUpperCase()}`,
          name: app.fullName || "Unknown",
          email: app.email || "-",
          branch: app.branchDisplayName || app.branch || "General",
          course: app.programApplied || "-",
          documentCount: Object.values(app.documents || {}).filter(Boolean).length,
          status: normalizeStatus(app.status),
          submissionDate: app.submittedAt || "",
        }));

        setApplications(mappedApplications);
        setTotalPages(Math.ceil((data.data?.total || 0) / limit));
        setIsError(null);
      } catch (err) {
        setIsError(err instanceof Error ? err.message : "An error occurred");
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [currentPage]);

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
        Error loading applications: {isError}
      </div>
    );
  }

  if (isLoading && applications.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#D5D4D4] p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#D5D4D4] bg-white">
      <div className="border-b border-[#D5D4D4] px-5 py-4">
        <h3 className="font-['Times_New_Roman',Times,serif] text-[28px] font-bold text-[#0F1723]">Applications Pending Verification</h3>
      </div>

      <div className="px-5 py-4">
        {applications.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No applications found.</p>
        ) : (
          applications.slice(0, 3).map((app) => (
            <div key={app._id} className="flex flex-wrap items-center gap-4 border-b border-[#E5E7EB] py-3 last:border-b-0">
              <div className="flex min-w-56 items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2DA8E1] text-[13px] font-semibold text-white">
                  {app.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#0F1723]">{app.name}</p>
                  <p className="text-[12px] text-[#6B7280]">{app.email} • {app.course} {app.branch}</p>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[11px] text-[#6B7280]">Documents</p>
                  <p className="text-[13px] font-semibold text-[#0F1723]">{app.documentCount} files</p>
                </div>

                <StatusBadge status={app.status} />

                <Link
                  href={`/general-office/applications/${app._id}`}
                  onClick={() => onReview?.(app._id)}
                  className="inline-flex items-center gap-2 rounded-md bg-[#2DA8E1] px-4 py-2 text-[12px] font-semibold text-white"
                >
                  Review
                  <FiChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
