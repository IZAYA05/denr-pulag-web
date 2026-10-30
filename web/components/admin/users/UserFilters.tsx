
"use client";

import { Search } from "lucide-react";

interface UserFiltersProps {
  search: string;
  role: string;
  status: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const roleOptions = [
  { label: "All Roles", value: "All Roles" },
  { label: "Employee", value: "Employee" },
  { label: "Organizer", value: "Organizer" },
  { label: "User", value: "User" },
];

const statusOptions = [
  { label: "All Status", value: "All Status" },
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

export default function UserFilters({
  search,
  role,
  status,
  onSearchChange,
  onRoleChange,
  onStatusChange,
}: UserFiltersProps) {
  const selectClassName =
    "h-12 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 text-sm text-white outline-none transition hover:border-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-md">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          aria-hidden="true"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search users..."
          aria-label="Search users"
          className="h-12 w-full rounded-2xl border border-zinc-700 bg-zinc-900 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-500 hover:border-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={role}
          onChange={(event) => onRoleChange(event.target.value)}
          aria-label="Filter users by role"
          className={`${selectClassName} w-full sm:min-w-[120px]`}
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          aria-label="Filter users by status"
          className={`${selectClassName} w-full sm:min-w-[120px]`}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
