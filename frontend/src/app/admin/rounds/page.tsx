"use client";

import { useMemo, useState } from "react";
import { FiCalendar, FiClock, FiPlus } from "react-icons/fi";

type RoundStatus = "active" | "frozen" | "closed";

type AdmissionRound = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  deadline: string;
  status: RoundStatus;
};

const STORAGE_KEY = "admin_admission_rounds_v1";

function loadRounds(): AdmissionRound[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRounds(rounds: AdmissionRound[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds));
}

function formatDateLabel(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRoundYearLabel(startDate: string): string {
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return "2024-25";
  const startYear = date.getFullYear();
  const nextYearShort = String(startYear + 1).slice(-2);
  return `${startYear}-${nextYearShort}`;
}

function toIsoDate(value: string): string {
  return new Date(`${value}T00:00:00`).toISOString();
}

export default function RoundsPage() {
  const [rounds, setRounds] = useState<AdmissionRound[]>(() => {
    const existing = loadRounds();
    if (existing.length > 0) return existing;

    const seeded = [
      {
        id: "round-default",
        title: "Admission Round 2024-25",
        description: "Main admission round for academic year 2024-25",
        startDate: new Date("2024-01-01").toISOString(),
        deadline: new Date("2025-09-30").toISOString(),
        status: "active" as RoundStatus,
      },
    ];

    saveRounds(seeded);
    return seeded;
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    deadline: "",
  });

  const sortedRounds = useMemo(() => {
    return [...rounds].sort((a, b) => {
      const at = new Date(b.startDate).getTime();
      const bt = new Date(a.startDate).getTime();
      return at - bt;
    });
  }, [rounds]);

  const openCreateForm = () => {
    setFormError("");
    setShowCreateForm(true);
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setFormError("");
    setFormData({
      title: "",
      description: "",
      startDate: "",
      deadline: "",
    });
  };

  const submitCreateRound = () => {
    if (!formData.title.trim() || !formData.startDate || !formData.deadline) {
      setFormError("Round Name, Start Date and Application Deadline are required.");
      return;
    }

    const startMs = new Date(`${formData.startDate}T00:00:00`).getTime();
    const deadlineMs = new Date(`${formData.deadline}T00:00:00`).getTime();
    if (Number.isNaN(startMs) || Number.isNaN(deadlineMs) || deadlineMs < startMs) {
      setFormError("Application Deadline must be on or after Start Date.");
      return;
    }

    const trimmedTitle = formData.title.trim();
    const roundDescription = formData.description.trim();

    const createdRound: AdmissionRound = {
      id: `round-${Date.now()}`,
      title: trimmedTitle,
      description:
        roundDescription ||
        `Main admission round for academic year ${getRoundYearLabel(toIsoDate(formData.startDate))}`,
      startDate: toIsoDate(formData.startDate),
      deadline: toIsoDate(formData.deadline),
      status: "active",
    };

    setRounds((prev) => {
      const created = [createdRound, ...prev];
      saveRounds(created);
      return created;
    });

    closeCreateForm();
  };

  const updateRoundStatus = (id: string, status: RoundStatus) => {
    setRounds((prev) => {
      const updated = prev.map((round) => (round.id === id ? { ...round, status } : round));
      saveRounds(updated);
      return updated;
    });
  };

  return (
    <section className="w-full max-w-269.75 space-y-5 [font-family:var(--font-inter)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-['Times_New_Roman',Times,serif] text-[38px] leading-10 font-bold text-[#111827]">
            Admission Rounds
          </h1>
          <p className="text-[14px] leading-4.25 text-[#6B7280] mt-1">
            Create and manage admission round lifecycle
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="h-9.5 px-4 rounded-md bg-[#2DA8E1] text-white text-[14px] font-medium inline-flex items-center gap-2"
        >
          <FiPlus className="text-[15px]" />
          Create Round
        </button>
      </div>

      {showCreateForm ? (
        <div className="w-full rounded-lg border border-[#D2D6DC] bg-white p-6">
          <div className="w-full max-w-225 space-y-5">
            <h2 className="font-['Times_New_Roman',Times,serif] text-[32px] leading-tight font-bold text-[#111827]">
              Create New Round
            </h2>

            <div className="space-y-2">
              <label htmlFor="round-name" className="text-sm font-medium text-[#111827]">
                Round Name*
              </label>
              <input
                id="round-name"
                value={formData.title}
                onChange={(event) => {
                  const title = event.target.value;
                  setFormData((prev) => ({ ...prev, title }));

                  if (!formData.description.trim() && /^Admission Round\s+\d{4}-\d{2}$/i.test(title.trim())) {
                    setFormData((prev) => ({
                      ...prev,
                      title,
                      description: `Main admission round for academic year ${title.trim().replace(/Admission Round\s+/i, "")}`,
                    }));
                  }
                }}
                placeholder="e.g. Admission Round 2025-26"
                className="w-full h-10 rounded-md border border-[#D1D5DB] px-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2DA8E1]/30"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="round-description" className="text-sm font-medium text-[#111827]">
                Description
              </label>
              <textarea
                id="round-description"
                value={formData.description}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={4}
                placeholder="Main admission round for academic year 2025-26"
                className="w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2DA8E1]/30 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="start-date" className="text-sm font-medium text-[#111827]">
                  Start Date*
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={formData.startDate}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: event.target.value,
                    }))
                  }
                  className="w-full h-10 rounded-md border border-[#D1D5DB] px-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2DA8E1]/30"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="deadline" className="text-sm font-medium text-[#111827]">
                  Application Deadline*
                </label>
                <input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      deadline: event.target.value,
                    }))
                  }
                  className="w-full h-10 rounded-md border border-[#D1D5DB] px-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2DA8E1]/30"
                />
              </div>
            </div>

            {formError ? <p className="text-sm text-[#DC2626]">{formError}</p> : null}

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={closeCreateForm}
                className="h-10 px-4 rounded-md border border-[#D1D5DB] bg-white text-sm font-medium text-[#374151]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitCreateRound}
                className="h-10 px-4 rounded-md bg-[#2DA8E1] text-sm font-medium text-white"
              >
                Create Round
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {sortedRounds.map((round) => {
          const isActive = round.status === "active";
          const isFrozen = round.status === "frozen";
          const isClosed = round.status === "closed";

          return (
            <article
              key={round.id}
              className="rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-[16px] leading-5 font-semibold text-[#0F172A]">{round.title}</h2>

                    <span
                      className={`h-4.5 px-2 rounded text-[11px] font-semibold inline-flex items-center ${
                        isActive
                          ? "bg-[#E3FBDE] text-[#0B9339]"
                          : isFrozen
                            ? "bg-[#EFF6FF] text-[#1D4ED8]"
                            : "bg-[#FCDAD8] text-[#E51818]"
                      }`}
                    >
                      {isActive ? "Active" : isFrozen ? "Frozen" : "Closed"}
                    </span>
                  </div>

                  <p className="mt-3 text-[14px] leading-4.25 text-[#475569]">{round.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateRoundStatus(round.id, isFrozen ? "active" : "frozen")}
                    disabled={isClosed}
                    className="h-4.5 px-2 rounded text-[11px] font-bold bg-[#EFF6FF] text-[#1D4ED8] disabled:opacity-45"
                  >
                    {isFrozen ? "Unfreeze" : "Freeze"}
                  </button>

                  <button
                    type="button"
                    onClick={() => updateRoundStatus(round.id, "closed")}
                    disabled={isClosed}
                    className="h-4.5 px-2 rounded text-[11px] font-bold bg-[#FCDAD8] text-[#E51818] disabled:opacity-45"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-6 flex-wrap">
                <div className="inline-flex items-center gap-1.5 text-[13px] text-[#64748B]">
                  <FiCalendar className="text-[#2563EB] text-[13px]" />
                  <span>Starts: {formatDateLabel(round.startDate)}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 text-[13px] text-[#64748B]">
                  <FiClock className="text-[#DC2626] text-[13px]" />
                  <span>Deadline: {formatDateLabel(round.deadline)}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
