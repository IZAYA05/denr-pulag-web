"use client";

import {
  Eye,
  Pencil,
  KeyRound,
  UserX,
  MoreHorizontal,
} from "lucide-react";

export default function UserActions() {
  return (
    <details className="relative inline-block">
      <summary className="flex cursor-pointer list-none items-center justify-center rounded-xl p-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-800">
        <MoreHorizontal className="h-5 w-5 text-zinc-500" />
      </summary>

      <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <button className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <Eye className="h-4 w-4" />
          View User
        </button>

        <button className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <Pencil className="h-4 w-4" />
          Edit User
        </button>

        <button className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <KeyRound className="h-4 w-4 text-blue-500" />
          Reset Password
        </button>

        <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
          <UserX className="h-4 w-4" />
          Disable Account
        </button>
      </div>
    </details>
  );
}