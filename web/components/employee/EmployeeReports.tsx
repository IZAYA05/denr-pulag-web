"use client";

import { useCallback, useEffect, useState } from "react";
import { useEmployeeDashboard } from "@/components/employee/EmployeeDashboardClient";

type BookingStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  confirmed_visitors: number;
};

type ReportResponse = {
  date?: string;
  direct_reservations?: Partial<BookingStats>;
  package_bookings?: Partial<BookingStats>;
  total_confirmed_visitors?: number;
  message?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  if (!value) return "Selected date";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function normalizeStats(stats?: Partial<BookingStats>): BookingStats {
  return {
    total: Number(stats?.total ?? 0),
    pending: Number(stats?.pending ?? 0),
    approved: Number(stats?.approved ?? 0),
    rejected: Number(stats?.rejected ?? 0),
    confirmed_visitors: Number(stats?.confirmed_visitors ?? 0),
  };
}

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {value.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          {icon}
        </div>
      </div>
    </div>
  );
}

function BookingBreakdown({
  title,
  description,
  stats,
}: {
  title: string;
  description: string;
  stats: BookingStats;
}) {
  const items = [
    {
      label: "Total Bookings",
      value: stats.total,
      color: "bg-gray-400",
      text: "text-gray-900 dark:text-white",
    },
    {
      label: "Pending",
      value: stats.pending,
      color: "bg-amber-500",
      text: "text-amber-700 dark:text-amber-300",
    },
    {
      label: "Approved",
      value: stats.approved,
      color: "bg-emerald-500",
      text: "text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      color: "bg-red-500",
      text: "text-red-700 dark:text-red-300",
    },
  ];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {items.map((item) => {
          const percentage =
            stats.total > 0 ? (item.value / stats.total) * 100 : 0;

          return (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {item.label}
                </span>
                <span className={`text-sm font-semibold ${item.text}`}>
                  {item.value.toLocaleString()}
                </span>
              </div>

              <div
                className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                role="progressbar"
                aria-label={item.label}
                aria-valuemin={0}
                aria-valuemax={stats.total || 1}
                aria-valuenow={item.value}
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${item.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Confirmed visitors
        </span>
        <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
          {stats.confirmed_visitors.toLocaleString()}
        </span>
      </div>
    </section>
  );
}

export default function EmployeeReports() {
  const { accessToken } = useEmployeeDashboard();

  const [date, setDate] = useState(getToday);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = useCallback(
    async (signal?: AbortSignal) => {
      if (!accessToken) return;

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/api/employee/reports?date=${encodeURIComponent(date)}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
            signal,
          }
        );

        const data = (await response.json()) as ReportResponse;

        if (!response.ok) {
          throw new Error(data.message || "Unable to load the daily report.");
        }

        setReport(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while loading the report."
        );
        setReport(null);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [accessToken, date]
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadReport(controller.signal);

    return () => controller.abort();
  }, [loadReport]);

  const directStats = normalizeStats(report?.direct_reservations);
  const packageStats = normalizeStats(report?.package_bookings);

  const totalBookings = directStats.total + packageStats.total;
  const totalPending = directStats.pending + packageStats.pending;
  const totalApproved = directStats.approved + packageStats.approved;
  const totalRejected = directStats.rejected + packageStats.rejected;

  const confirmedVisitors = Number(
    report?.total_confirmed_visitors ??
      directStats.confirmed_visitors + packageStats.confirmed_visitors
  );

  const summaryCards = [
    {
      label: "Total Bookings",
      value: totalBookings,
      description: "Direct and package bookings",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 11h18" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "Pending Bookings",
      value: totalPending,
      description: "Awaiting review",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Approved Bookings",
      value: totalApproved,
      description: "Approved across both sources",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Confirmed Visitors",
      value: confirmedVisitors,
      description: "Visitors on approved bookings",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" />
          <circle cx="10" cy="7" r="4" />
          <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Employee Portal
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Daily Reports
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Review daily booking activity and visitor totals.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:min-w-64">
          <label
            htmlFor="report-date"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Select report date
          </label>
          <input
            id="report-date"
            type="date"
            value={date}
            max={getToday()}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
            Report for
          </p>
          <p className="mt-1 text-lg font-bold text-emerald-950 dark:text-emerald-100">
            {formatDate(date)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadReport()}
          disabled={loading || !accessToken}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
            <path d="M20 11a8 8 0 0 0-14.9-4M4 4v4h4M4 13a8 8 0 0 0 14.9 4M20 20v-4h-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Refresh Report
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
        >
          <p className="font-semibold">Could not load the report</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                description={card.description}
                icon={card.icon}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <BookingBreakdown
              title="Direct Reservations"
              description="Daily statistics for direct visitor reservations."
              stats={directStats}
            />

            <BookingBreakdown
              title="Package Bookings"
              description="Daily statistics for bookings made through packages."
              stats={packageStats}
            />
          </div>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Booking Status Summary
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Combined status totals for the selected report date.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Pending
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-900 dark:text-amber-200">
                  {totalPending.toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
                <p className="text-sm text-emerald-800 dark:text-emerald-300">
                  Approved
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-200">
                  {totalApproved.toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-300">
                  Rejected
                </p>
                <p className="mt-1 text-2xl font-bold text-red-900 dark:text-red-200">
                  {totalRejected.toLocaleString()}
                </p>
              </div>
            </div>
          </section>
        </>
      ) : (
        !error && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="font-semibold text-gray-900 dark:text-white">
              No report data available
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Select a date or refresh the report.
            </p>
          </div>
        )
      )}
    </div>
  );
}
