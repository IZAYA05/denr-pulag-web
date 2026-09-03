"use client";

import { CalendarRange, Mountain } from "lucide-react";

import Select from "@/components/ui/Select";

export default function ReportFilters() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Analytics Overview
      </h2>

      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Date Range */}

        <div className="relative">
          <CalendarRange className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <Select
            defaultValue="Last 7 Days"
            options={[
              "Last 7 Days",
              "Last 30 Days",
              "This Month",
              "This Year",
            ]}
            className="py-2.5 pl-10 pr-10"
          />
        </div>

        {/* Trail */}

        <div className="relative">
          <Mountain className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <Select
            defaultValue="All Trails"
            options={[
              "All Trails",
              "Ambangeg Trail",
              "Akiki Trail",
              "Tawangan Trail",
            ]}
            className="py-2.5 pl-10 pr-10"
          />
        </div>
      </div>
    </div>
  );
}