import { CalendarRange, Mountain } from "lucide-react";

export default function ReportFilters() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Analytics Overview
      </h2>

      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Date Range */}
        <div className="relative">
          <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <select className="rounded-2xl border border-zinc-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
        </div>

        {/* Trail */}
        <div className="relative">
          <Mountain className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <select className="rounded-2xl border border-zinc-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
            <option>All Trails</option>
            <option>Ambangeg Trail</option>
            <option>Akiki Trail</option>
            <option>Tawangan Trail</option>
          </select>
        </div>
      </div>
    </div>
  );
}