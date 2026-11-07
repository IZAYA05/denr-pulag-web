"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useEmployeeDashboard } from "@/components/employee/EmployeeDashboardClient";

type Trail = {
  id: number;
  name: string;
  description?: string | null;
  difficulty?: string | null;
  image?: string | null;
  max_capacity?: number | null;
  is_active?: boolean | number | string | null;
  approved_reservations_count?: number | string | null;
  approved_package_bookings_count?: number | string | null;
};

type TrailsResponse = {
  trails?: Trail[];
  message?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

function isTrailActive(value: Trail["is_active"]) {
  return value === true || value === 1 || value === "1";
}

function difficultyStyle(difficulty?: string | null) {
  switch ((difficulty || "").toLowerCase()) {
    case "easy":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "moderate":
    case "medium":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    case "difficult":
    case "hard":
    case "challenging":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

function TrailCard({
  trail,
  onView,
}: {
  trail: Trail;
  onView: (trail: Trail) => void;
}) {
  const active = isTrailActive(trail.is_active);
  const directBookings = Number(
    trail.approved_reservations_count ?? 0
  );
  const packageBookings = Number(
    trail.approved_package_bookings_count ?? 0
  );
  const totalBookings = directBookings + packageBookings;

  const imageUrl = trail.image
    ? trail.image.startsWith("http")
      ? trail.image
      : `${API_URL}/storage/${trail.image.replace(/^\/+/, "")}`
    : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-emerald-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-800">
      <div className="relative h-36 bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-950">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={trail.name}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}

        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
            active
              ? "bg-emerald-100 text-emerald-800"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {trail.name}
            </h2>

            {trail.difficulty && (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${difficultyStyle(
                  trail.difficulty
                )}`}
              >
                {trail.difficulty}
              </span>
            )}
          </div>

          <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm leading-5 text-gray-500 dark:text-gray-400">
            {trail.description || "No trail description provided."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/70">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Max Capacity
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              {trail.max_capacity ?? "—"}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/70">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Approved Bookings
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              {totalBookings.toLocaleString()}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onView(trail)}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-200 dark:hover:text-emerald-400"
        >
          View Trail Details
        </button>
      </div>
    </article>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/70">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

export default function EmployeeTrails() {
  const { accessToken } = useEmployeeDashboard();

  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setTrails([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadTrails() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/api/employee/trails`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
          signal: controller.signal,
        });

        const data: TrailsResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load trails.");
        }

        setTrails(Array.isArray(data.trails) ? data.trails : []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load trail records."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadTrails();

    return () => controller.abort();
  }, [accessToken]);

  const filteredTrails = useMemo(() => {
    const term = search.trim().toLowerCase();

    return trails.filter((trail) => {
      const matchesSearch =
        !term ||
        [trail.name, trail.description, trail.difficulty].some(
          (value) =>
            String(value ?? "").toLowerCase().includes(term)
        );

      const active = isTrailActive(trail.is_active);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && active) ||
        (statusFilter === "INACTIVE" && !active);

      const matchesDifficulty =
        difficultyFilter === "ALL" ||
        (trail.difficulty || "").toLowerCase() ===
          difficultyFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesDifficulty;
    });
  }, [trails, search, statusFilter, difficultyFilter]);

  const activeCount = trails.filter((trail) =>
    isTrailActive(trail.is_active)
  ).length;

  const inactiveCount = trails.length - activeCount;

  const totalApprovedBookings = trails.reduce(
    (sum, trail) =>
      sum +
      Number(trail.approved_reservations_count ?? 0) +
      Number(trail.approved_package_bookings_count ?? 0),
    0
  );

  const difficulties = Array.from(
    new Set(
      trails
        .map((trail) => trail.difficulty)
        .filter((value): value is string => Boolean(value))
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Employee Portal
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Trail Information
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Review available trails, difficulty levels, capacities, and approved
          bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Trails" value={trails.length} />
        <SummaryCard label="Active Trails" value={activeCount} />
        <SummaryCard label="Inactive Trails" value={inactiveCount} />
        <SummaryCard
          label="Approved Bookings"
          value={totalApprovedBookings}
        />
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search trails..."
            aria-label="Search trails"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by trail status"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          >
            <option value="ALL">All Trail Statuses</option>
            <option value="ACTIVE">Active Trails</option>
            <option value="INACTIVE">Inactive Trails</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(event) => setDifficultyFilter(event.target.value)}
            aria-label="Filter by trail difficulty"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          >
            <option value="ALL">All Difficulty Levels</option>
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-80 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : filteredTrails.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            No trails found
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredTrails.map((trail) => (
            <TrailCard
              key={trail.id}
              trail={trail}
              onView={setSelectedTrail}
            />
          ))}
        </div>
      )}

      {selectedTrail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedTrail(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="trail-details-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-200 p-5 dark:border-gray-800">
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Trail Details
                </p>
                <h2
                  id="trail-details-title"
                  className="mt-1 text-xl font-bold text-gray-900 dark:text-white"
                >
                  {selectedTrail.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTrail(null)}
                aria-label="Close trail details"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                {selectedTrail.description || "No description provided."}
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Detail
                  label="Status"
                  value={
                    isTrailActive(selectedTrail.is_active)
                      ? "Active"
                      : "Inactive"
                  }
                />
                <Detail
                  label="Difficulty"
                  value={selectedTrail.difficulty || "Not specified"}
                />
                <Detail
                  label="Maximum Capacity"
                  value={selectedTrail.max_capacity ?? "Not specified"}
                />
                <Detail
                  label="Approved Direct Reservations"
                  value={Number(
                    selectedTrail.approved_reservations_count ?? 0
                  )}
                />
                <Detail
                  label="Approved Package Bookings"
                  value={Number(
                    selectedTrail.approved_package_bookings_count ?? 0
                  )}
                />
                <Detail
                  label="Total Approved Bookings"
                  value={
                    Number(
                      selectedTrail.approved_reservations_count ?? 0
                    ) +
                    Number(
                      selectedTrail.approved_package_bookings_count ?? 0
                    )
                  }
                />
              </div>

              <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                This employee view is read-only. Trail configuration and
                activation changes should be handled by authorized administrators.
              </p>
            </div>

            <div className="flex justify-end border-t border-gray-200 p-5 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setSelectedTrail(null)}
                className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
