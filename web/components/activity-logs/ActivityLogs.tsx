"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  RefreshCw,
  Search,
} from "lucide-react";

type Actor = {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  role?: string | null;
} | null;

type ActivityLog = {
  id: number;
  action: string;
  module: string;
  description?: string | null;
  role?: string | null;
  created_at: string;
  user?: Actor;
  initiated_by?: Actor;
  conversation_id?: number | null;
  message_count?: number | null;
  first_activity_at?: string | null;
  last_activity_at?: string | null;
  conversation_status?: string | null;
  conversation_type?: string | null;
};

type Filters = {
  search: string;
  action: string;
  module: string;
  role: string;
  date_from: string;
  date_to: string;
};

type ApiResponse = {
  message?: string;
  data?: {
    data?: ActivityLog[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

const emptyFilters: Filters = {
  search: "",
  action: "",
  module: "",
  role: "",
  date_from: "",
  date_to: "",
};

function label(value?: string | null) {
  return value
    ? value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "—";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function actorName(log: ActivityLog) {
  const actor = log.initiated_by || log.user;
  if (!actor) return "Unknown account";

  const name = [actor.first_name, actor.last_name]
    .filter(Boolean)
    .join(" ");

  return name || actor.email || "Unknown account";
}

export default function ActivityLogs({
  accessToken,
  viewerRole,
}: {
  accessToken: string;
  viewerRole: "ADMIN" | "EMPLOYEE";
}) {
  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLogs = useCallback(async (signal?: AbortSignal) => {
    if (!accessToken) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: "20",
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value.trim()) params.set(key, value.trim());
      });

      const response = await fetch(
        `${API_URL}/api/activity-logs?${params.toString()}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
          signal,
        }
      );

      const result = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(result.message || "Unable to load activity logs.");
      }

      if (signal?.aborted) return;

      const data = result.data;

      setLogs(Array.isArray(data?.data) ? data.data : []);
      setPage(data?.current_page ?? 1);
      setLastPage(data?.last_page ?? 1);
      setPerPage(data?.per_page ?? 20);
      setTotal(data?.total ?? 0);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred."
      );
      setLogs([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [accessToken, filters, page]);

  useEffect(() => {
    const controller = new AbortController();
    void loadLogs(controller.signal);
    return () => controller.abort();
  }, [loadLogs]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setFilters({ ...draft });
  }

  function clearFilters() {
    setDraft(emptyFilters);
    setFilters(emptyFilters);
    setPage(1);
  }

  const inputClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Activity size={20} />
            <span className="text-sm font-semibold uppercase tracking-wide">
              System Monitoring
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
            Activity Logs
          </h1>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {viewerRole === "ADMIN"
              ? "Review recorded activities across the system."
              : "Review activities performed by visitors and organizers."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadLogs()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <form
        onSubmit={applyFilters}
        className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="mb-4 flex items-center gap-2 font-semibold text-zinc-800 dark:text-white">
          <Search size={17} />
          Search and Filters
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <label>
            <span className="mb-1.5 block text-xs text-zinc-500">Search</span>
            <input
              className={inputClass}
              placeholder="Description, action, user..."
              value={draft.search}
              onChange={(e) =>
                setDraft({ ...draft, search: e.target.value })
              }
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs text-zinc-500">Action</span>
            <input
              className={inputClass}
              placeholder="e.g. CREATED"
              value={draft.action}
              onChange={(e) =>
                setDraft({ ...draft, action: e.target.value })
              }
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs text-zinc-500">Module</span>
            <input
              className={inputClass}
              placeholder="e.g. MESSAGING"
              value={draft.module}
              onChange={(e) =>
                setDraft({ ...draft, module: e.target.value })
              }
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs text-zinc-500">Role</span>
            <select
              className={inputClass}
              value={draft.role}
              onChange={(e) =>
                setDraft({ ...draft, role: e.target.value })
              }
            >
              <option value="">All permitted roles</option>
              {viewerRole === "ADMIN" && (
                <>
                  <option value="ADMIN">Admin</option>
                  <option value="EMPLOYEE">Employee</option>
                </>
              )}
              <option value="USER">User</option>
              <option value="ORGANIZER">Organizer</option>
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-xs text-zinc-500">From</span>
            <input
              type="date"
              className={inputClass}
              value={draft.date_from}
              onChange={(e) =>
                setDraft({ ...draft, date_from: e.target.value })
              }
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs text-zinc-500">To</span>
            <input
              type="date"
              className={inputClass}
              value={draft.date_to}
              onChange={(e) =>
                setDraft({ ...draft, date_to: e.target.value })
              }
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Apply Filters
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Clear
          </button>
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-1 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              Recorded Activities
            </h2>
            <p className="text-xs text-zinc-500">
              {total.toLocaleString()} matching records
            </p>
          </div>

          <span className="text-xs text-zinc-500">
            Page {page} of {lastPage}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-zinc-500">
            Loading activity logs...
          </div>
        ) : error ? (
          <div
            role="alert"
            className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <Activity size={28} className="text-zinc-400" />
            <p className="mt-3 font-semibold text-zinc-800 dark:text-white">
              No activity logs found
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {logs.map((log) => {
              const summary =
                log.action === "CONVERSATION_SUMMARY" &&
                log.module === "MESSAGING";

              return (
                <article key={log.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      {summary ? (
                        <MessageCircle size={19} />
                      ) : (
                        <Activity size={19} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                          {summary
                            ? "Conversation Activity Summary"
                            : label(log.action)}
                        </h3>

                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {label(log.module)}
                        </span>

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          {label(log.role)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                        {log.description || "No description recorded."}
                      </p>

                      {summary && (
                        <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/20 sm:grid-cols-4">
                          <div>
                            <p className="text-xs text-zinc-500">Conversation ID</p>
                            <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-white">
                              #{log.conversation_id ?? "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-zinc-500">Type</p>
                            <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-white">
                              {label(log.conversation_type)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-zinc-500">Status</p>
                            <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-white">
                              {label(log.conversation_status)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-zinc-500">Messages</p>
                            <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-white">
                              {(log.message_count ?? 0).toLocaleString()}
                            </p>
                          </div>

                          <div className="col-span-2">
                            <p className="text-xs text-zinc-500">First Activity</p>
                            <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">
                              {formatDate(log.first_activity_at)}
                            </p>
                          </div>

                          <div className="col-span-2">
                            <p className="text-xs text-zinc-500">Last Activity</p>
                            <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">
                              {formatDate(log.last_activity_at)}
                            </p>
                          </div>
                        </div>
                      )}

                      <p className="mt-3 text-xs text-zinc-400">
                        Actor: {actorName(log)} ·{" "}
                        {formatDate(
                          summary
                            ? log.last_activity_at || log.created_at
                            : log.created_at
                        )}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-zinc-200 px-5 py-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            Showing{" "}
            {logs.length ? (page - 1) * perPage + 1 : 0}–
            {(page - 1) * perPage + logs.length} of {total}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={loading || page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(lastPage, current + 1))
              }
              disabled={loading || page >= lastPage}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
