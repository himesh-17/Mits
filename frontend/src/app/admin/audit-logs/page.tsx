"use client";

import { useEffect, useMemo, useState } from "react";
import { FiShield } from "react-icons/fi";
import { api } from "../../../utils/api";

type BackendAuditLog = {
  _id: string;
  actorName?: string;
  actorRoleLabel?: string;
  actionLabel: string;
  actionTone: "green" | "slate";
  department: string;
  departmentTone: "orange" | "purple" | "green" | "slate";
  entityRef?: string;
  fromStatus?: string;
  toStatus?: string;
  createdAt: string;
};

type AuditLogItem = {
  id: string;
  actorInitial: string;
  actionLabel: string;
  actionTone: "green" | "slate";
  department: string;
  departmentTone: "orange" | "purple" | "green" | "slate";
  entityRef: string;
  actorRole: string;
  fromStatus: string;
  toStatus: string;
  timestamp: string;
};

function prettifyStatus(value = ""): string {
  if (!value) return "-";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "-";

  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${datePart}, ${timePart.toLowerCase()}`;
}

function pillTone(
  tone: AuditLogItem["actionTone"] | AuditLogItem["departmentTone"],
): string {
  if (tone === "green") {
    return "bg-[#DCFCE7] text-[#166534]";
  }

  if (tone === "orange") {
    return "bg-[#FFEDD5] text-[#9A3412]";
  }

  if (tone === "purple") {
    return "bg-[#F3E8FF] text-[#6B21A8]";
  }

  return "bg-[#F1F5F9] text-[#334155]";
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAuditLogs() {
      setIsLoading(true);
      setError("");

      try {
        const res = await api.get("/api/admin/audit-logs", {
          params: { page: 1, limit: 50 },
        });

        const rawLogs: BackendAuditLog[] = res.data?.data?.logs || [];
        const mapped = rawLogs.map((log) => {
          const actorRole = log.actorRoleLabel || "System";
          const actorInitial = (log.actorName || actorRole || "S")
            .trim()
            .charAt(0)
            .toUpperCase();

          return {
            id: log._id,
            actorInitial: actorInitial || "S",
            actionLabel: prettifyStatus(log.actionLabel),
            actionTone: log.actionTone || "green",
            department: log.department || "ADMIN PANEL",
            departmentTone: log.departmentTone || "slate",
            entityRef: log.entityRef || "-",
            actorRole,
            fromStatus: prettifyStatus(log.fromStatus || ""),
            toStatus: prettifyStatus(log.toStatus || ""),
            timestamp: formatTimestamp(log.createdAt),
          } as AuditLogItem;
        });

        setLogs(mapped);
      } catch {
        setError("Failed to load audit logs.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAuditLogs();
  }, []);

  const entriesLabel = useMemo(() => {
    if (isLoading) return "Loading...";
    return `${logs.length} entries`;
  }, [isLoading, logs.length]);

  return (
    <div className="admin-section-enter w-full">
      <div className="mb-6">
        <h1 className="text-[38px] leading-none font-semibold text-[#0F1724]">
          Audit Logs
        </h1>
        <p className="mt-3 text-[18px] text-[#94A3B8]">
          Complete record of all system actions
        </p>
      </div>

      <section className="bg-white border border-black/10 rounded-lg overflow-hidden">
        <header className="h-15.25 px-6 border-b border-black/10 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[#0F1724]">
            <FiShield className="text-[18px] text-[#94A3B8]" />
            <span className="font-semibold text-[15px]">System Activity Log</span>
          </div>
          <span className="text-[13px] text-[#94A3B8]">{entriesLabel}</span>
        </header>

        <div>
          {error ? (
            <div className="px-6 py-8 text-sm text-red-500">{error}</div>
          ) : null}

          {!isLoading && !error && logs.length === 0 ? (
            <div className="px-6 py-8 text-sm text-[#94A3B8]">No audit logs found.</div>
          ) : null}

          {logs.map((log, index) => (
            <article
              key={log.id}
              className="admin-row-enter px-6 py-5 border-b last:border-b-0 border-black/10 flex gap-4"
              style={{ animationDelay: `${Math.min(index * 20, 240)}ms` }}
            >
              <div className="h-9 w-9 rounded-full bg-[#F1F5F9] text-[#475569] text-[14px] font-medium flex items-center justify-center shrink-0 mt-0.5">
                {log.actorInitial}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-[11px] font-semibold tracking-[0.5px] ${pillTone(log.actionTone)}`}
                      >
                        {log.actionLabel}
                      </span>

                      <span
                        className={`px-2 py-1 rounded text-[11px] font-semibold tracking-[0.5px] ${pillTone(log.departmentTone)}`}
                      >
                        {log.department}
                      </span>

                      <span className="text-[13px] text-[#94A3B8]">{log.entityRef}</span>
                    </div>

                    <p className="mt-2 text-[14px] text-[#0F1724] flex flex-wrap items-center gap-2">
                      <span className="font-medium">{log.actorRole}</span>
                      <span className="text-[#94A3B8] line-through">{log.fromStatus}</span>
                      <span className="text-[#94A3B8]">-&gt;</span>
                      <span className="text-[#475569]">{log.toStatus}</span>
                    </p>
                  </div>

                  <div className="shrink-0 pt-1 text-[12px] text-[#94A3B8] whitespace-nowrap">
                    {log.timestamp}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
