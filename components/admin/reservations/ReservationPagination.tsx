"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ReservationPagination() {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950 md:flex-row md:items-center md:justify-between">
      {/* Left */}
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Showing <span className="font-semibold text-zinc-900 dark:text-white">1–10</span> of{" "}
        <span className="font-semibold text-zinc-900 dark:text-white">264</span> reservations
      </p>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button className="h-10 w-10 rounded-xl bg-emerald-600 font-semibold text-white">
          1
        </button>

        <button className="h-10 w-10 rounded-xl border border-zinc-200 transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          2
        </button>

        <button className="h-10 w-10 rounded-xl border border-zinc-200 transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          3
        </button>

        <span className="px-2 text-zinc-500">...</span>

        <button className="h-10 w-10 rounded-xl border border-zinc-200 transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          27
        </button>

        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}