import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

export default function AnnouncementActions() {
  return (
    <div className="flex items-center gap-2">
      {/* View */}

      <button
        className="rounded-xl border border-zinc-200 p-2.5 text-zinc-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-emerald-500/20 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
        title="View"
      >
        <Eye className="h-4 w-4" />
      </button>

      {/* Edit */}

      <button
        className="rounded-xl border border-zinc-200 p-2.5 text-zinc-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-500/20 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>

      {/* Delete */}

      <button
        className="rounded-xl border border-zinc-200 p-2.5 text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-red-500/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}