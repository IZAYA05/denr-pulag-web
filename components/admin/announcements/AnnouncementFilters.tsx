import { Filter, Plus, Search } from "lucide-react";

type AnnouncementFiltersProps = {
  onNewAnnouncement: () => void;
};

export default function AnnouncementFilters({
  onNewAnnouncement,
}: AnnouncementFiltersProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Search */}

      <div className="relative w-full lg:max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

        <input
          type="text"
          placeholder="Search announcements..."
          className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Status Filter */}

        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <select className="rounded-2xl border border-zinc-200 bg-white py-3 pl-10 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
            <option>Scheduled</option>
            <option>Archived</option>
          </select>
        </div>

        {/* New Announcement */}

        <button
            onClick={onNewAnnouncement}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
            <Plus className="h-4 w-4" />
            New Announcement
        </button>
      </div>
    </div>
  );
}