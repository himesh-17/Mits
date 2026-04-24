"use client";

import { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiLock, FiSearch } from "react-icons/fi";
import { api } from "../../../utils/api";

type RoleKey =
  | "administrator"
  | "admissionCell"
  | "accountOffice"
  | "generalOffice"
  | "hod"
  | "student";

type UserRow = {
  _id: string;
  name?: string;
  email?: string;
  role: RoleKey;
  isActive: boolean;
};

const ROLE_BADGE_CLASS: Record<RoleKey, string> = {
  administrator: "bg-[#F1F5F9] text-[#475569]",
  admissionCell: "bg-[#F3E8FF] text-[#7E22CE]",
  accountOffice: "bg-[#DCFCE7] text-[#15803D]",
  generalOffice: "bg-[#FEF3C7] text-[#B45309]",
  hod: "bg-[#FEE2E2] text-[#B91C1C]",
  student: "bg-[#E5E7EB] text-[#374151]",
};

const FILTER_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "administrator", label: "Super Admin" },
  { value: "admissionCell", label: "Admission Cell" },
  { value: "accountOffice", label: "Accountant" },
  { value: "generalOffice", label: "General Office" },
  { value: "hod", label: "HOD" },
] as const;

const EDITABLE_ROLE_OPTIONS: Array<{ value: Exclude<RoleKey, "student">; label: string }> = [
  { value: "administrator", label: "SUPER ADMIN" },
  { value: "admissionCell", label: "ADMISSION CELL" },
  { value: "accountOffice", label: "ACCOUNTANT" },
  { value: "generalOffice", label: "GENERAL OFFICE" },
  { value: "hod", label: "HOD" },
];

function cleanText(value: unknown, fallback = "-") {
  const normalized = String(value ?? fallback)
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim();

  return normalized.length ? normalized : fallback;
}

export default function UsersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [roleSavingUserId, setRoleSavingUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<(typeof FILTER_OPTIONS)[number]["value"]>("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const toggleUserAccess = async (user: UserRow) => {
    setActionUserId(user._id);
    setError("");

    try {
      const endpoint = user.isActive
        ? `/api/admin/users/${user._id}/deactivate`
        : `/api/admin/users/${user._id}/activate`;

      await api.patch(endpoint);

      setUsers((prev) =>
        prev.map((row) =>
          row._id === user._id ? { ...row, isActive: !row.isActive } : row,
        ),
      );
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        `Failed to ${user.isActive ? "lock" : "unlock"} user.`;
      setError(message);
    } finally {
      setActionUserId(null);
    }
  };

  const changeUserRole = async (user: UserRow, newRole: Exclude<RoleKey, "student">) => {
    if (user.role === newRole) return;

    setRoleSavingUserId(user._id);
    setError("");

    try {
      await api.patch(`/api/admin/users/${user._id}/role`, { role: newRole });

      setUsers((prev) =>
        prev.map((row) =>
          row._id === user._id ? { ...row, role: newRole } : row,
        ),
      );
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update role.";
      setError(message);
    } finally {
      setRoleSavingUserId(null);
    }
  };

  useEffect(() => {
    let alive = true;

    async function fetchUsers() {
      setIsLoading(true);
      setError("");

      try {
        const params: Record<string, string | number> = {
          page: 1,
          limit: 100,
        };

        if (roleFilter !== "all") {
          params.role = roleFilter;
        }

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        const res = await api.get("/api/admin/users", { params });
        const rows = Array.isArray(res?.data?.data?.users) ? res.data.data.users : [];
        const nonStudents = rows.filter((row: UserRow) => row.role !== "student");

        if (!alive) return;
        setUsers(nonStudents);
      } catch {
        if (!alive) return;
        setError("Failed to load users.");
        setUsers([]);
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    }

    fetchUsers();

    return () => {
      alive = false;
    };
  }, [roleFilter, debouncedSearch]);

  const summary = useMemo(() => {
    const count = {
      admissionCell: 0,
      accountOffice: 0,
      administrator: 0,
      generalOffice: 0,
      hod: 0,
    };

    users.forEach((user) => {
      if (user.role in count) {
        count[user.role as keyof typeof count] += 1;
      }
    });

    return count;
  }, [users]);

  const cardItems = [
    { key: "admissionCell", label: "ADMISSION CELL", value: summary.admissionCell, tone: ROLE_BADGE_CLASS.admissionCell },
    { key: "accountOffice", label: "ACCOUNTANT", value: summary.accountOffice, tone: ROLE_BADGE_CLASS.accountOffice },
    { key: "administrator", label: "SUPER ADMIN", value: summary.administrator, tone: ROLE_BADGE_CLASS.administrator },
    { key: "generalOffice", label: "GENERAL OFFICE", value: summary.generalOffice, tone: ROLE_BADGE_CLASS.generalOffice },
    { key: "hod", label: "HOD", value: summary.hod, tone: ROLE_BADGE_CLASS.hod },
  ];

  return (
    <section className="admin-section-enter w-full space-y-4 [font-family:var(--font-poppins)]">
      <div className="space-y-1">
        <h1 className="font-[var(--font-poppins)] text-[38px] leading-10 font-bold text-[#111827]">
          User Management
        </h1>
        <p className="text-[14px] leading-4.25 text-[#6B7280]">
          Manage roles, access, and account status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {cardItems.slice(0, 3).map((item) => (
          <div key={item.key} className="h-14 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] px-5 flex items-center gap-3">
            <span className={`h-6 px-3 rounded text-[11px] font-bold tracking-[0.24px] inline-flex items-center ${item.tone}`}>
              {item.label}
            </span>
            <span className="font-[var(--font-poppins)] text-[32px] leading-none font-bold text-[#111827]">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {cardItems.slice(3).map((item) => (
          <div key={item.key} className="h-14 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] px-5 flex items-center gap-3">
            <span className={`h-6 px-3 rounded text-[11px] font-bold tracking-[0.24px] inline-flex items-center ${item.tone}`}>
              {item.label}
            </span>
            <span className="font-[var(--font-poppins)] text-[32px] leading-none font-bold text-[#111827]">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 h-12">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[18px]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-full rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] pl-11 pr-4 text-[14px] text-[#111827] outline-none"
          />
        </div>

        <div className="relative w-full md:w-50 h-12">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as (typeof FILTER_OPTIONS)[number]["value"])}
            className="appearance-none w-full h-full rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] px-4 text-[14px] text-[#374151] outline-none"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] text-[18px]" />
        </div>
      </div>

      <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="grid grid-cols-[2.2fr_1.8fr_1fr_1fr_0.9fr] h-12 border-b border-[#E5E7EB] px-4 text-[11px] font-semibold tracking-[0.55px] uppercase text-[#6B7280] items-center">
          <span>User</span>
          <span>Role</span>
          <span>Applications</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {error ? <p className="px-4 py-6 text-[13px] text-[#B91C1C]">{error}</p> : null}

        {isLoading ? (
          <p className="px-4 py-6 text-[13px] text-[#6B7280]">Loading users...</p>
        ) : null}

        {!isLoading && !error && users.length === 0 ? (
          <p className="px-4 py-6 text-[13px] text-[#6B7280]">No users found.</p>
        ) : null}

        {!isLoading && !error
          ? users.map((user, index) => {
              const role = user.role || "student";
              const roleClass = ROLE_BADGE_CLASS[role] || ROLE_BADGE_CLASS.student;
              const initial = cleanText(user.name || user.email || "U", "U").charAt(0).toUpperCase();

              return (
                <div
                  key={user._id}
                  className="admin-row-enter grid grid-cols-[2.2fr_1.8fr_1fr_1fr_0.9fr] h-16 border-b last:border-b-0 border-[#E5E7EB] px-4 items-center"
                  style={{ animationDelay: `${Math.min(index * 20, 240)}ms` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-[#2563EB] text-white text-[14px] font-semibold inline-flex items-center justify-center shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] leading-4.25 text-[#111827] font-medium truncate">
                        {cleanText(user.name, "Unknown")}
                      </p>
                      <p className="text-[13px] leading-4 text-[#6B7280] truncate">
                        {cleanText(user.email, "-")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className={`h-5.5 rounded-[20px] inline-flex items-center ${roleClass}`}>
                      <select
                        value={role}
                        disabled={roleSavingUserId === user._id}
                        onChange={(e) => changeUserRole(user, e.target.value as Exclude<RoleKey, "student">)}
                        className="appearance-none h-5.5 px-2.5 rounded-[20px] bg-transparent text-[11px] font-semibold outline-none disabled:opacity-60"
                      >
                        {EDITABLE_ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <FiChevronDown className="text-[11px] mr-2" />
                    </div>
                  </div>

                  <span className="text-[14px] text-[#4B5563]">0</span>

                  <div>
                    <span
                      className={`h-5.75 px-2.5 rounded text-[12px] inline-flex items-center ${
                        user.isActive ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#B91C1C]"
                      }`}
                    >
                      {user.isActive ? "Active" : "Locked"}
                    </span>
                  </div>

                  <div className="justify-self-end">
                    <button
                      type="button"
                      disabled={actionUserId === user._id}
                      onClick={() => toggleUserAccess(user)}
                      className="admin-btn text-[13px] text-[#DC2626] inline-flex items-center gap-1.5 disabled:opacity-60"
                    >
                      <FiLock className="text-[13px]" />
                      {actionUserId === user._id ? "Saving..." : user.isActive ? "Lock" : "Unlock"}
                    </button>
                  </div>
                </div>
              );
            })
          : null}
      </div>
    </section>
  );
}
