"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiRefreshCw, FiSearch, FiArrowRight } from "react-icons/fi";
import { api } from "../../../utils/api";
import StatusBadge from "../../../components/admin/StatusBadge";
import ApplicationCard from "../../../components/admin/ApplicationCard";

type AppRow = {
    id: string;
    name: string;
    email: string;
    program: string;
    branch: string;
    status: string;
    date: string;
    allotedRound: string;
};

const STATUS_OPTIONS = [
    "All Statuses", "Draft", "Submitted", "Under Review", "Documents Verified",
    "Document Rejected", "Payment Pending", "Payment Verified", "Finalized", "Rejected",
] as const;

const PROGRAM_OPTIONS = ["All Programs", "BTECH", "MBA", "MSC", "BCA", "MCA"] as const;

const MOCK_DATA: AppRow[] = [
    { id: "mock-1", name: "Arjun Mehta", email: "arjun@gmail.com", program: "BTECH", branch: "CSE", status: "Under Review", date: "28 Mar 2026", allotedRound: "Round 1" },
    { id: "mock-2", name: "Sneha Patel", email: "sneha@gmail.com", program: "BTECH", branch: "ECE", status: "Submitted", date: "27 Mar 2026", allotedRound: "Round 1" },
    { id: "mock-3", name: "Rahul Sharma", email: "rahul@gmail.com", program: "BTECH", branch: "MECH", status: "Documents Verified", date: "26 Mar 2026", allotedRound: "Round 1" },
    { id: "mock-4", name: "Priya Singh", email: "priya@gmail.com", program: "BTECH", branch: "IT", status: "Payment Pending", date: "25 Mar 2026", allotedRound: "Round 2" },
    { id: "mock-5", name: "Amit Kumar", email: "amit@gmail.com", program: "BTECH", branch: "AI", status: "Finalized", date: "24 Mar 2026", allotedRound: "Round 1" },
    { id: "mock-6", name: "Neha Gupta", email: "neha@gmail.com", program: "BTECH", branch: "CIVIL", status: "Rejected", date: "23 Mar 2026", allotedRound: "Round 1" },
    { id: "mock-7", name: "Karan Verma", email: "karan@gmail.com", program: "BTECH", branch: "EE", status: "Draft", date: "22 Mar 2026", allotedRound: "Round 2" },
    { id: "mock-8", name: "Ananya Joshi", email: "ananya@gmail.com", program: "MBA", branch: "MBA", status: "Under Review", date: "21 Mar 2026", allotedRound: "Round 1" },
];

export default function ApplicationsPage() {
    const [rows, setRows] = useState<AppRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("All Statuses");
    const [selectedProgram, setSelectedProgram] = useState<string>("All Programs");

    const fetchApplications = useCallback(async () => {
        try {
            const response = await api.get("/api/admin/student-data", {
                params: { page: 1, limit: 500 },
            });
            const groups = Array.isArray(response?.data?.data?.groups) ? response.data.data.groups : [];
            const allItems: AppRow[] = groups.flatMap(
                (g: { items: AppRow[] }) => Array.isArray(g.items) ? g.items : []
            );
            setRows(allItems.length > 0 ? allItems : MOCK_DATA);
        } catch {
            setRows(MOCK_DATA);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { void fetchApplications(); }, [fetchApplications]);

    const filtered = useMemo(() => {
        let list = rows;
        if (selectedStatus !== "All Statuses") list = list.filter((r) => r.status === selectedStatus);
        if (selectedProgram !== "All Programs") list = list.filter((r) => r.program === selectedProgram);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((r) => r.name.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q));
        }
        return list;
    }, [rows, selectedStatus, selectedProgram, search]);

    return (
        <section className="admin-section-enter w-full space-y-5 [font-family:var(--font-inter)]">
            {/* Header */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="font-['Times_New_Roman',Times,serif] text-[34px] md:text-[38px] leading-10.5 font-bold text-[#0F172A]">
                        Applications
                    </h1>
                    <p className="text-[15px] leading-5.5 text-[#94A3B8]">
                        Review and manage all student applications
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => { setRefreshing(true); void fetchApplications(); }}
                    className="admin-btn h-9.5 px-4 border border-black/10 rounded-md bg-white inline-flex items-center gap-2 text-[13px] text-[#0F1724]"
                >
                    <FiRefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-[16px]" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-11 pl-10 pr-3 rounded-lg bg-white border border-black/10 text-[14px] text-[#0F1724] outline-none focus:ring-2 focus:ring-[#2DA8E1]/30 placeholder-[#94A3B8]"
                    />
                </div>
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-white border border-black/10 text-[14px] text-[#0F1724] outline-none focus:ring-2 focus:ring-[#2DA8E1]/30"
                >
                    {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-white border border-black/10 text-[14px] text-[#0F1724] outline-none focus:ring-2 focus:ring-[#2DA8E1]/30"
                >
                    {PROGRAM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>

            {/* Loading */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 bg-white rounded-lg border border-black/10 animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-lg border border-black/10 p-12 text-center">
                    <p className="text-[18px] font-semibold text-[#94A3B8]">No applications found</p>
                    <p className="text-[13px] text-[#CBD5E1] mt-1">Try adjusting your filters or search query.</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-lg border border-black/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="h-11 bg-[#F8FAFC] text-[12px] font-semibold tracking-[0.5px] uppercase text-[#94A3B8]">
                                        <th className="px-5">Applicant Name</th>
                                        <th className="px-5">Program / Branch</th>
                                        <th className="px-5">Round</th>
                                        <th className="px-5">Status</th>
                                        <th className="px-5">Updated</th>
                                        <th className="px-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((row, idx) => (
                                        <tr
                                            key={row.id}
                                            className="admin-row-enter h-14 text-[14px] text-[#0F1724] border-t border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors duration-200"
                                            style={{ animationDelay: `${Math.min(idx * 25, 300)}ms` }}
                                        >
                                            <td className="px-5">
                                                <span className="font-medium">{row.name}</span>
                                            </td>
                                            <td className="px-5 text-[#64748B]">{row.program} — {row.branch}</td>
                                            <td className="px-5 text-[#64748B]">{row.allotedRound || "-"}</td>
                                            <td className="px-5"><StatusBadge status={row.status} /></td>
                                            <td className="px-5 text-[#64748B]">{row.date}</td>
                                            <td className="px-5 text-right">
                                                <Link
                                                    href={`/admin/applications/${row.id}`}
                                                    className="admin-btn h-8 px-3.5 rounded-md border border-black/10 bg-white text-[12px] font-medium text-[#0F1724] inline-flex items-center gap-1 hover:bg-[#EFF6FF] hover:text-[#2DA8E1] hover:border-[#2DA8E1]/30 transition-colors"
                                                >
                                                    View
                                                    <FiArrowRight className="text-[13px]" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden grid grid-cols-1 gap-3">
                        {filtered.map((row) => (
                            <ApplicationCard
                                key={row.id}
                                id={row.id}
                                name={row.name}
                                program={row.program}
                                branch={row.branch}
                                round={row.allotedRound || "-"}
                                status={row.status}
                                date={row.date}
                            />
                        ))}
                    </div>
                </>
            )}

            <p className="text-[12px] text-[#94A3B8]">{filtered.length} application(s) shown</p>
        </section>
    );
}
