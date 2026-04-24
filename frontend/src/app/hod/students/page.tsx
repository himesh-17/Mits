"use client";

import { useEffect, useMemo, useState } from "react";

interface HodStudent {
  _id: string;
  fullName?: string;
  rollNumber?: string;
  branch?: string;
  programApplied?: string;
  semester?: string;
  phone?: string;
  admittedAt?: string;
  status?: string;
}

export default function HodStudentsPage() {
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [students, setStudents] = useState<HodStudent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hod/branches`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error("Failed to load branches");

        const payload = await response.json();
        const nextBranches: string[] = payload.data?.branches || [];
        setBranches(nextBranches);
        setSelectedBranch(payload.data?.defaultBranch || nextBranches[0] || "");
      } catch (error) {
        console.error("Failed to load HOD branches:", error);
      }
    };

    loadBranches();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedBranch && branches.length > 0) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const query = selectedBranch ? `?branch=${encodeURIComponent(selectedBranch)}` : "";
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hod/students${query}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Failed to load admitted students");
        const payload = await response.json();
        setStudents(payload.data?.applications || []);
      } catch (error) {
        console.error("Failed to load admitted students:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [selectedBranch, branches.length]);

  const admittedCount = students.length;

  const formattedRows = useMemo(
    () =>
      students.map((student) => ({
        id: student._id,
        name: student.fullName || "Unknown",
        roll: student.rollNumber || "-",
        program: student.programApplied || "-",
        branch: student.branch || selectedBranch || "-",
        semester: student.semester || "-",
        phone: student.phone || "-",
        admittedAt: student.admittedAt
          ? new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date(student.admittedAt))
          : "-",
      })),
    [students, selectedBranch]
  );

  return (
    <div className="space-y-4 [font-family:var(--font-poppins)]">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-poppins)] text-[43px] font-bold leading-none text-[#1E293B]">
            Finalized Admissions
          </h1>
          <p className="mt-2 text-[14px] text-[#7B7B7B]">
            Select your branch to view finalized admitted students.
          </p>
        </div>

        <div className="rounded-md border border-[#D5D4D4] bg-white px-4 py-2 text-[13px] font-medium text-[#0F1724]">
          Total Finalized: {admittedCount}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-[22rem_1fr]">
        <div className="rounded-md border border-[#D5D4D4] bg-white p-3">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
            Department / Branch
          </p>
          <select
            value={selectedBranch}
            onChange={(event) => setSelectedBranch(event.target.value)}
            className="h-10 w-full rounded-md border border-[#D5D4D4] bg-white px-3 text-[13px] text-[#0F1724] outline-none"
          >
            {branches.length === 0 ? (
              <option value="">No Branches</option>
            ) : (
              branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))
            )}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-[#D5D4D4] bg-white">
        <div className="border-b border-[#D5D4D4] px-4 py-3">
          <h2 className="font-[var(--font-poppins)] text-[30px] font-bold leading-none text-[#111827]">
            Finalized Admitted Students
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-[#D5D4D4] bg-[#F9FAFB] text-left text-[12px] font-semibold text-[#0F1724]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Roll No.</th>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Semester</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Admitted On</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-[13px] text-[#64748B]">
                    Loading admitted students...
                  </td>
                </tr>
              ) : formattedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-[13px] text-[#64748B]">
                    No finalized admitted students found for this branch.
                  </td>
                </tr>
              ) : (
                formattedRows.map((row) => (
                  <tr key={row.id} className="border-b border-[#E5E7EB] last:border-b-0">
                    <td className="px-4 py-3 text-[13px] text-[#1E293B]">{row.name}</td>
                    <td className="px-4 py-3 text-[13px] text-[#334155]">{row.roll}</td>
                    <td className="px-4 py-3 text-[13px] text-[#334155]">{row.program}</td>
                    <td className="px-4 py-3 text-[13px] text-[#334155]">{row.branch}</td>
                    <td className="px-4 py-3 text-[13px] text-[#334155]">{row.semester}</td>
                    <td className="px-4 py-3 text-[13px] text-[#334155]">{row.phone}</td>
                    <td className="px-4 py-3 text-[13px] text-[#334155]">{row.admittedAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
