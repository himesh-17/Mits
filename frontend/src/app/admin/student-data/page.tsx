"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiDownload, FiRefreshCw } from "react-icons/fi";
import { api } from "../../../utils/api";

type StudentRow = {
  id: string;
  name: string;
  email: string;
  rank: string;
  marks: string;
  rollNo: string;
  father: string;
  mother: string;
  eligibleCategory: string;
  allotedCategory: string;
  domicile: string;
  gender: string;
  phoneNo: string;
  ews: string;
  program: string;
  branch: string;
  status: string;
  finalStatus: string;
  date: string;
  allotedRound: string;
  sourceFile?: string;
  roundTitle?: string;
};

type StudentGroup = {
  sheetName: string;
  count: number;
  items: StudentRow[];
};

type RoundOption = {
  id: string;
  title: string;
  status: "active" | "frozen" | "closed";
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
  "Not Matched",
] as const;

const PROGRAM_OPTIONS = ["All Programs", "BTECH", "MBA", "MSC", "BCA", "MCA"] as const;

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

  if (status === "Not Matched") {
    return "bg-[#F1F5F9] text-[#475569]";
  }

  return "bg-[#F1F5F9] text-[#475569]";
}

export default function StudentDataPage() {
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [rounds, setRounds] = useState<RoundOption[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState("");

  const [selectedStatus, setSelectedStatus] = useState<(typeof STATUS_OPTIONS)[number]>("All Statuses");
  const [selectedProgram, setSelectedProgram] = useState<(typeof PROGRAM_OPTIONS)[number]>("All Programs");

  const allRows = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  const fetchRounds = useCallback(async () => {
    try {
      const response = await api.get("/api/admin/rounds");
      const items = Array.isArray(response?.data?.data?.rounds) ? response.data.data.rounds : [];
      setRounds(items);
      if (!selectedRoundId && items.length > 0) {
        setSelectedRoundId(items[0].id);
      }
    } catch {
      setRounds([]);
    }
  }, [selectedRoundId]);

  const fetchStudentData = useCallback(async () => {
    if (!selectedRoundId) {
      setGroups([]);
      setIsLoading(false);
      return;
    }

    const safeStatus = STATUS_OPTIONS.includes(selectedStatus) ? selectedStatus : "All Statuses";
    const safeProgram = PROGRAM_OPTIONS.includes(selectedProgram) ? selectedProgram : "All Programs";

    try {
      setError("");
      const response = await api.get("/api/admin/student-data", {
        params: {
          page: 1,
          limit: 500,
          status: safeStatus,
          program: safeProgram,
          roundId: selectedRoundId,
        },
      });

      const groupPayload = Array.isArray(response?.data?.data?.groups) ? response.data.data.groups : [];

      const normalizedGroups: StudentGroup[] = groupPayload.map((group: StudentGroup) => ({
        sheetName: sanitizeText(group.sheetName, "Sheet-Unspecified"),
        count: Number(group.count || 0),
        items: (Array.isArray(group.items) ? group.items : []).map((item: StudentRow) => ({
          id: sanitizeText(item.id),
          name: sanitizeText(item.name),
          email: sanitizeText(item.email),
          rank: sanitizeText(item.rank),
          marks: sanitizeText(item.marks),
          rollNo: sanitizeText(item.rollNo),
          father: sanitizeText(item.father),
          mother: sanitizeText(item.mother),
          eligibleCategory: sanitizeText(item.eligibleCategory),
          allotedCategory: sanitizeText(item.allotedCategory),
          domicile: sanitizeText(item.domicile),
          gender: sanitizeText(item.gender).toUpperCase(),
          phoneNo: sanitizeText(item.phoneNo),
          ews: sanitizeText(item.ews),
          program: sanitizeText(item.program).toUpperCase(),
          branch: sanitizeText(item.branch).toUpperCase(),
          status: sanitizeText(item.status),
          finalStatus: sanitizeText(item.finalStatus),
          date: sanitizeText(item.date),
          allotedRound: sanitizeText(item.allotedRound),
          sourceFile: sanitizeText(item.sourceFile, "Sheet-Unspecified"),
          roundTitle: sanitizeText(item.roundTitle, "-"),
        })),
      }));

      setGroups(normalizedGroups);
    } catch {
      setError("Failed to load round-based student data.");
      setGroups([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [selectedProgram, selectedRoundId, selectedStatus]);

  useEffect(() => {
    void fetchRounds();
  }, [fetchRounds]);

  useEffect(() => {
    setIsLoading(true);
    void fetchStudentData();
  }, [fetchStudentData]);

  const handleRefresh = () => {
    setRefreshing(true);
    void fetchStudentData();
  };

  const handleExportCsv = () => {
    const header = [
      "Round",
      "Sheet",
      "Student Name",
      "Email",
      "Rank",
      "Marks",
      "RollNo",
      "Father",
      "Mother",
      "Eligible Category",
      "Alloted Category",
      "Domicile",
      "Gender",
      "PhoneNo",
      "EWS",
      "Program",
      "Branch",
      "Status",
      "Final Status",
      "Date",
      "Alloted Round",
    ];
    const body = allRows.map((row) => [
      row.roundTitle || "-",
      row.sourceFile || "Sheet-Unspecified",
      row.name,
      row.email,
      row.rank,
      row.marks,
      row.rollNo,
      row.father,
      row.mother,
      row.eligibleCategory,
      row.allotedCategory,
      row.domicile,
      row.gender,
      row.phoneNo,
      row.ews,
      row.program,
      row.branch,
      row.status,
      row.finalStatus,
      row.date,
      row.allotedRound,
    ]);

    const csv = [header, ...body]
      .map((line) => line.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "student-data-round-wise.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="admin-section-enter w-full space-y-4 [font-family:var(--font-inter)]">
      <div className="flex flex-col gap-3 lg:h-16.25 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-['Times_New_Roman',Times,serif] text-[24px] leading-9 font-bold text-[#0F1724]">Student Data</h1>
          <p className="text-[14px] leading-5.25 text-[#94A3B8]">Round-wise student data grouped by uploaded sheets</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pb-1">
          <button type="button" onClick={handleRefresh} className="admin-btn h-9.75 w-33.75 bg-white border border-black/10 rounded-md inline-flex items-center justify-center gap-2 text-[14px] text-[#0F1724]">
            <FiRefreshCw className="text-[16px]" />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button type="button" onClick={handleExportCsv} className="admin-btn h-9.75 w-37.5 bg-white border border-black/10 rounded-md inline-flex items-center justify-center gap-2 text-[14px] font-medium text-[#0F1724]">
            <FiDownload className="text-[16px]" />
            Export CSV
          </button>
        </div>
      </div>

      {error ? <p className="text-[13px] text-[#B91C1C]">{error}</p> : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="text-[13px] text-[#64748B] space-y-1.5">
          <span>Round</span>
          <select value={selectedRoundId} onChange={(e) => setSelectedRoundId(e.target.value)} className="w-full h-11 px-3 rounded-lg bg-white border border-black/10 text-[15px] text-[#0F1724] outline-none focus:ring-2 focus:ring-[#2DA8E1]/30">
            {rounds.map((round) => (
              <option key={round.id} value={round.id}>
                {round.title} ({round.status})
              </option>
            ))}
          </select>
        </label>

        <label className="text-[13px] text-[#64748B] space-y-1.5">
          <span>Status</span>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as (typeof STATUS_OPTIONS)[number])} className="w-full h-11 px-3 rounded-lg bg-white border border-black/10 text-[15px] text-[#0F1724] outline-none focus:ring-2 focus:ring-[#2DA8E1]/30">
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="text-[13px] text-[#64748B] space-y-1.5">
          <span>Program</span>
          <select value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value as (typeof PROGRAM_OPTIONS)[number])} className="w-full h-11 px-3 rounded-lg bg-white border border-black/10 text-[15px] text-[#0F1724] outline-none focus:ring-2 focus:ring-[#2DA8E1]/30">
            {PROGRAM_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? <p className="text-[14px] text-[#64748B]">Loading student data...</p> : null}
      {!isLoading && groups.length === 0 ? <p className="text-[14px] text-[#64748B]">No records found for this round and filters.</p> : null}

      {groups.map((group) => (
        <div key={group.sheetName} className="bg-white border border-black/10 rounded-lg overflow-hidden">
          <div className="px-4 py-2 border-b border-black/10 bg-[#F8FAFC] text-[13px] font-semibold text-[#334155]">
            {group.sheetName} ({group.count})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-450 border-collapse text-left">
              <thead>
                <tr className="h-12 text-[12px] font-semibold tracking-[0.5px] uppercase text-[#94A3B8]">
                  <th className="px-6 border-b border-black/10">Student Name</th>
                  <th className="px-6 border-b border-black/10">Email</th>
                  <th className="px-6 border-b border-black/10">Rank</th>
                  <th className="px-6 border-b border-black/10">Marks</th>
                  <th className="px-6 border-b border-black/10">RollNo</th>
                  <th className="px-6 border-b border-black/10">Father</th>
                  <th className="px-6 border-b border-black/10">Mother</th>
                  <th className="px-6 border-b border-black/10">Eligible Category</th>
                  <th className="px-6 border-b border-black/10">Alloted Category</th>
                  <th className="px-6 border-b border-black/10">Domicile</th>
                  <th className="px-6 border-b border-black/10">Gender</th>
                  <th className="px-6 border-b border-black/10">PhoneNo</th>
                  <th className="px-6 border-b border-black/10">EWS</th>
                  <th className="px-6 border-b border-black/10">Program</th>
                  <th className="px-6 border-b border-black/10">Branch</th>
                  <th className="px-6 border-b border-black/10">Status</th>
                  <th className="px-6 border-b border-black/10">Final Status</th>
                  <th className="px-6 border-b border-black/10">Date</th>
                  <th className="px-6 border-b border-black/10">Alloted Round</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((row, index) => (
                  <tr key={row.id} className="admin-row-enter h-17.5 text-[14px] text-[#0F1724]" style={{ animationDelay: `${Math.min(index * 22, 260)}ms` }}>
                    <td className="px-6 border-b border-black/10"><div className="leading-4.25 font-medium">{row.name}</div></td>
                    <td className="px-6 border-b border-black/10">{row.email}</td>
                    <td className="px-6 border-b border-black/10">{row.rank}</td>
                    <td className="px-6 border-b border-black/10">{row.marks}</td>
                    <td className="px-6 border-b border-black/10">{row.rollNo}</td>
                    <td className="px-6 border-b border-black/10">{row.father}</td>
                    <td className="px-6 border-b border-black/10">{row.mother}</td>
                    <td className="px-6 border-b border-black/10">{row.eligibleCategory}</td>
                    <td className="px-6 border-b border-black/10">{row.allotedCategory}</td>
                    <td className="px-6 border-b border-black/10">{row.domicile}</td>
                    <td className="px-6 border-b border-black/10">{row.gender}</td>
                    <td className="px-6 border-b border-black/10">{row.phoneNo}</td>
                    <td className="px-6 border-b border-black/10">{row.ews}</td>
                    <td className="px-6 border-b border-black/10"><div className="leading-4.25 font-medium">{row.program}</div></td>
                    <td className="px-6 border-b border-black/10">{row.branch}</td>
                    <td className="px-6 border-b border-black/10"><span className={`inline-flex items-center h-5.75 px-2.5 rounded text-[12px] font-semibold ${statusClass(row.status)}`}>{row.status}</span></td>
                    <td className="px-6 border-b border-black/10"><span className={`inline-flex items-center h-5.75 px-2.5 rounded text-[12px] font-semibold ${statusClass(row.finalStatus)}`}>{row.finalStatus}</span></td>
                    <td className="px-6 border-b border-black/10">{row.date}</td>
                    <td className="px-6 border-b border-black/10">{row.allotedRound}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}
