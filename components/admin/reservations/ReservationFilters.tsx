"use client";

import { Search, Calendar, Download } from "lucide-react";

export default function ReservationFilters() {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}
        <div className="flex flex-1 flex-col gap-4 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              type="text"
              placeholder="Search booking ID or group leader..."
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:bg-zinc-950"
            />
          </div>

          {/* Status */}
          <select className="h-11 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition-all focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Cancelled</option>
          </select>

          {/* Trail */}
          <select className="h-11 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition-all focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
            <option>All Trails</option>
            <option>Ambangeg</option>
            <option>Akiki</option>
            <option>Tawangan</option>
          </select>

          {/* Date */}
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              type="date"
              className="h-11 rounded-2xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 text-sm outline-none transition-all focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>

        {/* Right */}
        <button
          className="
            flex
            h-11
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-emerald-600
            px-5
            font-medium
            text-white
            transition-all
            hover:bg-emerald-700
          "
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
    </section>
  );
}