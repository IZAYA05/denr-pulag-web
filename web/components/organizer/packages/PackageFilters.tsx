"use client";

import { Search } from "lucide-react";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import { usePackages } from "./PackageContext";

export default function PackageFilters() {
  const {
    search,
    statusFilter,
    setSearch,
    setStatusFilter,
  } = usePackages();

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full lg:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search packages..."
          className="pl-9"
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          options={[
            "All Status",
            "Active",
            "Inactive",
          ]}
        />
      </div>
    </div>
  );
}