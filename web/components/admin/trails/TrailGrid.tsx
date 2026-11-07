
"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Mountain } from "lucide-react";

import { useDashboard } from "@/components/admin/DashboardClient";
import TrailCard, { Trail } from "./TrailCard";

type ApiResponse = {
  trails?: Trail[];
  message?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

export default function TrailGrid() {
  const { accessToken } = useDashboard();

  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrails = useCallback(
    async (signal?: AbortSignal) => {
      if (!accessToken) {
        setTrails([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/admin/trails`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
          signal,
        });

        const result: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load trail records."
          );
        }

        if (!signal?.aborted) {
          setTrails(
            Array.isArray(result.trails) ? result.trails : []
          );
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load trail records."
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [accessToken]
  );

  useEffect(() => {
    const controller = new AbortController();

    void fetchTrails(controller.signal);

    return () => controller.abort();
  }, [fetchTrails]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Registered Trails
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Trail information retrieved from the database.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchTrails()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <RefreshCw size={18} className="animate-spin" />
            Loading trails...
          </div>
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={() => void fetchTrails()}
            className="mt-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      ) : trails.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <div className="rounded-2xl bg-zinc-100 p-4 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <Mountain size={28} />
          </div>

          <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">
            No trails registered
          </h3>

          <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Trail records will appear here once they are added to the system.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {trails.map((trail) => (
              <TrailCard key={trail.id} trail={trail} />
            ))}
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Showing {trails.length} registered trail records.
          </p>
        </>
      )}
    </section>
  );
}
