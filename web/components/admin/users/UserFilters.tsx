"use client";

import { Search } from "lucide-react";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

type UserFiltersProps = {
  search: string;
  role: string;
  status: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export default function UserFilters({
  search,
  role,
  status,
  onSearchChange,
  onRoleChange,
  onStatusChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

        <Input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          className="py-2.5 pl-10 pr-4"
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Select
          value={role}
          onChange={(event) =>
            onRoleChange(event.target.value)
          }
          options={[
            "All Roles",
            "Administrator",
            "Employee",
            "User",
          ]}
          className="py-2.5"
        />

        <Select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value)
          }
          options={[
            "All Status",
            "Active",
            "Inactive",
          ]}
          className="py-2.5"
        />
      </div>
    </div>
  );
}