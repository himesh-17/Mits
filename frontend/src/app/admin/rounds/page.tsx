"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { FiCalendar, FiClock, FiPlus, FiUpload } from "react-icons/fi";
import { api } from "../../../utils/api";

type RoundStatus = "active" | "frozen" | "closed";

type AdmissionRound = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  deadline: string;
  status: RoundStatus;
  totalStudents: number;
  matchedStudents: number;
};

type RoundStudent = {
  id: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  studentPhone: string;
  fatherPhone: string;
  motherPhone: string;
  rollNumber: string;
  program: string;
  branch: string;
  sourceFile?: string;
  matched: boolean;
  matchedStatus: string;
};

type RoundStudentGroup = {
  sheetName: string;
  count: number;
  items: RoundStudent[];
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatDateLabel(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toIsoDate(value: string): string {
  return `${value}T00:00:00Z`;
}

export default function RoundsPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const studentListRef = useRef<HTMLDivElement | null>(null);

  const [rounds, setRounds] = useState<AdmissionRound[]>([]);
  const [loadingRounds, setLoadingRounds] = useState(true);
  const [roundError, setRoundError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    deadline: "",
  });

  const [selectedRoundId, setSelectedRoundId] = useState<string>("");
  const [roundStudentGroups, setRoundStudentGroups] = useState<RoundStudentGroup[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");

  const sortedRounds = useMemo(() => {
    return [...rounds].sort((a, b) => {
      const at = new Date(b.startDate).getTime();
      const bt = new Date(a.startDate).getTime();
      return at - bt;
    });
  }, [rounds]);

  const helperText = useMemo(() => {
    if (selectedFiles.length === 1) return selectedFiles[0].name;
    if (selectedFiles.length > 1) return `${selectedFiles.length} files selected`;
    return "CSV/XLSX required - Max 10MB per file";
  }, [selectedFiles]);

  const fetchRounds = useCallback(async () => {
    try {
      setRoundError("");
      const response = await api.get("/api/admin/rounds");
      const items = response?.data?.data?.rounds;
      if (!Array.isArray(items)) {
        setRounds([]);
        return;
      }
      setRounds(items);
      if (!selectedRoundId && items.length > 0) {
        setSelectedRoundId(items[0].id);
      }
    } catch {
      setRoundError("Failed to load rounds.");
      setRounds([]);
    } finally {
      setLoadingRounds(false);
    }
  }, [selectedRoundId]);

  useEffect(() => {
    void fetchRounds();
  }, [fetchRounds]);

  const fetchRoundStudents = async (roundId: string) => {
    if (!roundId) {
      setRoundStudentGroups([]);
      return;
    }
    try {
      setStudentsLoading(true);
      setStudentsError("");
      const response = await api.get(`/api/admin/rounds/${roundId}/students`, {
        params: { page: 1, limit: 500 },
      });
      const groups = response?.data?.data?.groups;
      if (Array.isArray(groups)) {
        setRoundStudentGroups(groups);
      } else {
        const rows = Array.isArray(response?.data?.data?.items) ? response.data.data.items : [];
        setRoundStudentGroups([
          {
            sheetName: "Sheet-Unspecified",
            count: rows.length,
            items: rows,
          },
        ]);
      }
    } catch {
      setStudentsError("Failed to load students for selected round.");
      setRoundStudentGroups([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    void fetchRoundStudents(selectedRoundId);
  }, [selectedRoundId]);

  const handleViewStudents = async (roundId: string) => {
    setSelectedRoundId(roundId);
    await fetchRoundStudents(roundId);
    studentListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openCreateForm = () => {
    setFormError("");
    setShowCreateForm(true);
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setFormError("");
    setSelectedFiles([]);
    setFormData({ title: "", description: "", startDate: "", deadline: "" });
  };

  const processFiles = (files: File[]) => {
    if (!files.length) return;

    const invalidExtFile = files.find((file) => {
      const lowerName = file.name.toLowerCase();
      return !(lowerName.endsWith(".csv") || lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls"));
    });

    if (invalidExtFile) {
      setFormError("Only CSV, XLSX, or XLS files are allowed.");
      return;
    }

    const oversizeFile = files.find((file) => file.size > MAX_FILE_SIZE);
    if (oversizeFile) {
      setFormError(`File too large: ${oversizeFile.name}. Maximum allowed size is 10MB per file.`);
      return;
    }

    setFormError("");
    setSelectedFiles(files);
  };

  const buildFilePayload = async () => {
    const filePayload: Array<{ fileName: string; rows: Record<string, unknown>[] }> = [];

    for (const file of selectedFiles) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
      const rows: Record<string, unknown>[] = [];

      for (const sheetName of workbook.SheetNames || []) {
        const sheet = workbook.Sheets[sheetName];
        const parsed = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
        rows.push(...parsed);
      }

      filePayload.push({ fileName: file.name, rows });
    }

    return filePayload;
  };

  const submitCreateRound = async () => {
    if (!formData.title.trim() || !formData.startDate || !formData.deadline) {
      setFormError("Round Name, Start Date and Application Deadline are required.");
      return;
    }

    if (!selectedFiles.length) {
      setFormError("Please upload at least one CSV/XLSX file for this round.");
      return;
    }

    const startIso = toIsoDate(formData.startDate);
    const deadlineIso = toIsoDate(formData.deadline);
    const startMs = new Date(startIso).getTime();
    const deadlineMs = new Date(deadlineIso).getTime();
    if (Number.isNaN(startMs) || Number.isNaN(deadlineMs) || deadlineMs <= startMs) {
      setFormError("Application Deadline must be after Start Date.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      const filePayload = await buildFilePayload();

      const response = await api.post("/api/admin/rounds", {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: startIso,
        deadline: deadlineIso,
        files: filePayload,
      });

      const createdRound = response?.data?.data?.round;
      await fetchRounds();
      if (createdRound?.id) {
        setSelectedRoundId(createdRound.id);
      }
      closeCreateForm();
    } catch (error: unknown) {
      const backendMessage =
        typeof error === "object" && error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "";
      setFormError(backendMessage || "Failed to create round with uploaded list.");
    } finally {
      setSubmitting(false);
    }
  };

  const onUpdateRoundStatus = async (roundId: string, status: RoundStatus) => {
    try {
      await api.patch(`/api/admin/rounds/${roundId}/status`, { status });
      await fetchRounds();
    } catch {
      setRoundError("Failed to update round status.");
    }
  };

  const onDeleteRound = async (roundId: string) => {
    const targetRound = rounds.find((round) => round.id === roundId);
    const confirmed = window.confirm(`Delete round \"${targetRound?.title || "this round"}\"? This will remove its uploaded student list.`);
    if (!confirmed) return;

    try {
      setRoundError("");
      await api.delete(`/api/admin/rounds/${roundId}`);

      const nextRounds = rounds.filter((round) => round.id !== roundId);
      if (selectedRoundId === roundId) {
        setSelectedRoundId(nextRounds[0]?.id || "");
      }

      await fetchRounds();
    } catch {
      setRoundError("Failed to delete round.");
    }
  };

  return (
    <section className="w-full space-y-5 [font-family:var(--font-poppins)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-[var(--font-poppins)] text-[38px] leading-10 font-bold text-[#111827]">Admission Rounds</h1>
          <p className="text-[14px] leading-4.25 text-[#6B7280] mt-1">Create rounds with Excel upload and view students grouped by uploaded sheets.</p>
        </div>
        <button type="button" onClick={openCreateForm} className="h-9.5 px-4 rounded-md bg-[#2DA8E1] text-white text-[14px] font-medium inline-flex items-center gap-2">
          <FiPlus className="text-[15px]" />
          Create Round
        </button>
      </div>

      {showCreateForm ? (
        <div className="w-full rounded-lg border border-[#D2D6DC] bg-white p-6">
          <div className="w-full space-y-5">
            <h2 className="font-[var(--font-poppins)] text-[32px] leading-tight font-bold text-[#111827]">Create New Round</h2>

            <div className="space-y-2">
              <label htmlFor="round-name" className="text-sm font-medium text-[#111827]">Round Name*</label>
              <input id="round-name" value={formData.title} onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))} placeholder="e.g. Admission Round 2026-27" className="w-full h-10 rounded-md border border-[#D1D5DB] px-3 text-sm text-[#111827]" />
            </div>

            <div className="space-y-2">
              <label htmlFor="round-description" className="text-sm font-medium text-[#111827]">Description</label>
              <textarea id="round-description" value={formData.description} onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))} rows={3} placeholder="Main admission round for academic year 2026-27" className="w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="start-date" className="text-sm font-medium text-[#111827]">Start Date*</label>
                <input id="start-date" type="date" value={formData.startDate} onChange={(event) => setFormData((prev) => ({ ...prev, startDate: event.target.value }))} className="w-full h-10 rounded-md border border-[#D1D5DB] px-3 text-sm text-[#111827]" />
              </div>
              <div className="space-y-2">
                <label htmlFor="deadline" className="text-sm font-medium text-[#111827]">Application Deadline*</label>
                <input id="deadline" type="date" value={formData.deadline} onChange={(event) => setFormData((prev) => ({ ...prev, deadline: event.target.value }))} className="w-full h-10 rounded-md border border-[#D1D5DB] px-3 text-sm text-[#111827]" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111827]">Upload Eligible Students (CSV/XLSX)*</label>
              <label className="h-30 w-full rounded-lg border border-dashed border-[#94A3B8] bg-[#F8FAFC] p-4 flex flex-col items-center justify-center gap-2 cursor-pointer">
                <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" multiple hidden onChange={(event) => processFiles(Array.from(event.target.files || []))} />
                <FiUpload className="text-[18px] text-[#2DA8E1]" />
                <p className="text-[13px] text-[#334155]">Click to select files</p>
                <p className="text-[12px] text-[#64748B]">{helperText}</p>
              </label>
            </div>

            {formError ? <p className="text-sm text-[#DC2626]">{formError}</p> : null}

            <div className="flex items-center justify-end gap-3 pt-1">
              <button type="button" onClick={closeCreateForm} className="h-10 px-4 rounded-md border border-[#D1D5DB] bg-white text-sm font-medium text-[#374151]">Cancel</button>
              <button type="button" onClick={() => { void submitCreateRound(); }} disabled={submitting} className="h-10 px-4 rounded-md bg-[#2DA8E1] text-sm font-medium text-white disabled:opacity-60">{submitting ? "Creating..." : "Create Round"}</button>
            </div>
          </div>
        </div>
      ) : null}

      {roundError ? <p className="text-sm text-[#B91C1C]">{roundError}</p> : null}

      <div className="space-y-4">
        {loadingRounds ? <p className="text-sm text-[#64748B]">Loading rounds...</p> : null}
        {sortedRounds.map((round) => {
          const isActive = round.status === "active";
          const isFrozen = round.status === "frozen";
          const isClosed = round.status === "closed";

          return (
            <article key={round.id} className={`rounded-lg border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-5 ${selectedRoundId === round.id ? "border-[#2DA8E1]" : "border-[#E2E8F0]"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-[16px] leading-5 font-semibold text-[#0F172A]">{round.title}</h2>
                    <span className={`h-4.5 px-2 rounded text-[11px] font-semibold inline-flex items-center ${isActive ? "bg-[#E3FBDE] text-[#0B9339]" : isFrozen ? "bg-[#EFF6FF] text-[#1D4ED8]" : "bg-[#FCDAD8] text-[#E51818]"}`}>
                      {isActive ? "Active" : isFrozen ? "Frozen" : "Closed"}
                    </span>
                  </div>
                  <p className="mt-3 text-[14px] leading-4.25 text-[#475569]">{round.description || "-"}</p>
                  <p className="mt-2 text-[13px] text-[#334155]">Eligible students: <strong>{round.totalStudents}</strong> | Verified applications: <strong>{round.matchedStudents}</strong></p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <button type="button" onClick={() => { void handleViewStudents(round.id); }} className="h-8 px-3 rounded-md border border-[#CBD5E1] bg-white text-[12px] font-semibold text-[#334155]">View Students</button>
                  <button type="button" onClick={() => { void onUpdateRoundStatus(round.id, isFrozen ? "active" : "frozen"); }} disabled={isClosed} className="h-8 px-3 rounded-md text-[12px] font-semibold bg-[#EFF6FF] text-[#1D4ED8] disabled:opacity-45">{isFrozen ? "Unfreeze" : "Freeze"}</button>
                  <button type="button" onClick={() => { void onUpdateRoundStatus(round.id, "closed"); }} disabled={isClosed} className="h-8 px-3 rounded-md text-[12px] font-semibold bg-[#FCDAD8] text-[#E51818] disabled:opacity-45">Close</button>
                  <button type="button" onClick={() => { void onDeleteRound(round.id); }} className="h-8 px-3 rounded-md text-[12px] font-semibold bg-[#FEE2E2] text-[#B91C1C]">Delete</button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-6 flex-wrap">
                <div className="inline-flex items-center gap-1.5 text-[13px] text-[#64748B]"><FiCalendar className="text-[#2563EB] text-[13px]" /><span>Starts: {formatDateLabel(round.startDate)}</span></div>
                <div className="inline-flex items-center gap-1.5 text-[13px] text-[#64748B]"><FiClock className="text-[#DC2626] text-[13px]" /><span>Deadline: {formatDateLabel(round.deadline)}</span></div>
              </div>
            </article>
          );
        })}
      </div>

      <div ref={studentListRef} className="rounded-lg border border-[#E2E8F0] bg-white p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-[#0F172A] text-[16px]">Round Student List</h3>
          <p className="text-[12px] text-[#64748B]">Data is grouped by uploaded sheet/file for the selected round.</p>
        </div>

        {studentsError ? <p className="text-[13px] text-[#B91C1C]">{studentsError}</p> : null}
        {studentsLoading ? <p className="text-[13px] text-[#64748B]">Loading students...</p> : null}

        {!studentsLoading && roundStudentGroups.length === 0 ? (
          <p className="text-[13px] text-[#64748B]">No students available for this round.</p>
        ) : null}

        {roundStudentGroups.map((group) => (
          <div key={group.sheetName} className="rounded-md border border-[#E2E8F0] overflow-hidden">
            <div className="px-4 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[13px] font-semibold text-[#334155]">{group.sheetName} ({group.count})</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-[13px]">
                <thead>
                  <tr className="text-left border-b border-[#E2E8F0]">
                    <th className="py-2 px-4">Student</th>
                    <th className="py-2 px-4">Father</th>
                    <th className="py-2 px-4">Mother</th>
                    <th className="py-2 px-4">Student Phone</th>
                    <th className="py-2 px-4">Father Phone</th>
                    <th className="py-2 px-4">Roll No</th>
                    <th className="py-2 px-4">Program</th>
                    <th className="py-2 px-4">Branch</th>
                    <th className="py-2 px-4">Match</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((row) => (
                    <tr key={row.id} className="border-b border-[#F1F5F9] text-[#334155]">
                      <td className="py-2 px-4">{row.studentName}</td>
                      <td className="py-2 px-4">{row.fatherName}</td>
                      <td className="py-2 px-4">{row.motherName}</td>
                      <td className="py-2 px-4">{row.studentPhone}</td>
                      <td className="py-2 px-4">{row.fatherPhone}</td>
                      <td className="py-2 px-4">{row.rollNumber}</td>
                      <td className="py-2 px-4">{row.program}</td>
                      <td className="py-2 px-4">{row.branch}</td>
                      <td className="py-2 px-4"><span className={row.matched ? "text-[#0B9339] font-semibold" : "text-[#9CA3AF]"}>{row.matched ? row.matchedStatus : "Not Matched"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
