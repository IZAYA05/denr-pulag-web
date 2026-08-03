"use client";

import { Search, Download } from "lucide-react";

export default function VisitorFilters() {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 lg:flex-row lg:items-center lg:justify-between">
      {/* Left */}
      <div className="flex flex-1 flex-col gap-4 lg:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

          <input
            type="text"
            placeholder="Search visitor..."
            className="w-full rounded-2xl border border-zinc-200 bg-transparent py-3 pl-12 pr-4 outline-none transition focus:border-emerald-500 dark:border-zinc-700"
          />
        </div>

        {/* Status */}
        <select className="rounded-2xl border border-zinc-200 bg-transparent px-4 py-3 outline-none transition focus:border-emerald-500 dark:border-zinc-700">
          <option>All Status</option>
          <option>Checked In</option>
          <option>Pending</option>
          <option>No Show</option>
        </select>

        {/* Trail */}
        <select className="rounded-2xl border border-zinc-200 bg-transparent px-4 py-3 outline-none transition focus:border-emerald-500 dark:border-zinc-700">
          <option>All Trails</option>
          <option>Ambangeg</option>
          <option>Akiki</option>
          <option>Tawangan</option>
        </select>

        {/* Date */}
        <input
          type="date"
          className="rounded-2xl border border-zinc-200 bg-transparent px-4 py-3 outline-none transition focus:border-emerald-500 dark:border-zinc-700"
        />
      </div>

      {/* Export */}
      <button className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700">
        <Download className="h-5 w-5" />
        Export
      </button>
    </div>
  );
}