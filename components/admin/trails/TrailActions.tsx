"use client";

import {
  Eye,
  Pencil,
  Users,
  RefreshCcw,
  MoreHorizontal,
} from "lucide-react";

export default function TrailActions() {
  return (
    <details className="relative inline-block">
      <summary className="flex cursor-pointer list-none items-center justify-center rounded-xl p-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-800">
        <MoreHorizontal className="h-5 w-5 text-zinc-500" />
      </summary>

      <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <button className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <Eye className="h-4 w-4" />
          View Trail
        </button>

        <button className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <Pencil className="h-4 w-4" />
          Edit Trail
        </button>

        <button className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <Users className="h-4 w-4 text-blue-500" />
          Manage Capacity
        </button>

        <button className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <RefreshCcw className="h-4 w-4 text-amber-500" />
          Change Status
        </button>
      </div>
    </details>
  );
}