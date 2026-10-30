"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  RefreshCw,
  Search,
  Users,
  UserRound,
  CalendarDays,
  MapPin,
  ClipboardList,
} from "lucide-react";

import { useEmployeeDashboard } from "@/components/employee/EmployeeDashboardClient";

type Visitor = {
  id: number;
  source: "DIRECT" | "PACKAGE";
  booking_id: number;
  booking_number: string;
  hiking_date: string;
  booking_status: string;
  trail?: string | null;
  full_name: string;
  age?: number | null;
  gender?: string | null;
  nationality?: string | null;
  contact_number?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
  emergency_number?: string | null;
};

type VisitorsResponse = {
  visitors?: Visitor[];
  message?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

function formatDate(value: string) {
  if (!value) return "Not specified";

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status: string) {
  switch (status.toUpperCase()) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300";
    case "PENDING":
      return "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300";
    case "REJECTED":
    case "CANCELLED":
      return "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300";
    default:
      return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
  }
}

function StatCard({
  label,
  value,
  icon,
  description,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/[0.02] dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {value.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function EmployeeVisitors() {
  const { accessToken } = useEmployeeDashboard();

  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"ALL" | "DIRECT" | "PACKAGE">("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  const fetchVisitors = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/employee/visitors`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
        signal,
      });

      const data: VisitorsResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load visitor records.");
      }

      setVisitors(data.visitors || []);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error ? err.message : "Unable to load visitor records."
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchVisitors(controller.signal);
    return () => controller.abort();
  }, [fetchVisitors]);

  const filteredVisitors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return visitors.filter((visitor) => {
      if (sourceFilter !== "ALL" && visitor.source !== sourceFilter) return false;

      if (
        statusFilter !== "ALL" &&
        visitor.booking_status.toUpperCase() !== statusFilter
      ) {
        return false;
      }

      if (!query) return true;

      return [
        visitor.full_name,
        visitor.booking_number,
        visitor.trail,
        visitor.nationality,
        visitor.contact_number,
        visitor.address,
      ].some((value) => String(value || "").toLowerCase().includes(query));
    });
  }, [visitors, search, sourceFilter, statusFilter]);

  const counts = useMemo(() => ({
    total: visitors.length,
    direct: visitors.filter((visitor) => visitor.source === "DIRECT").length,
    package: visitors.filter((visitor) => visitor.source === "PACKAGE").length,
    approved: visitors.filter((visitor) => visitor.booking_status === "APPROVED").length,
  }), [visitors]);

  function exportCsv() {
    const columns: { label: string; value: (visitor: Visitor) => string | number }[] = [
      { label: "Visitor Name", value: (visitor) => visitor.full_name },
      { label: "Age", value: (visitor) => visitor.age ?? "" },
      { label: "Gender", value: (visitor) => visitor.gender ?? "" },
      { label: "Nationality", value: (visitor) => visitor.nationality ?? "" },
      { label: "Contact Number", value: (visitor) => visitor.contact_number ?? "" },
      { label: "Address", value: (visitor) => visitor.address ?? "" },
      { label: "Booking Number", value: (visitor) => visitor.booking_number },
      { label: "Booking Type", value: (visitor) => visitor.source },
      { label: "Trail", value: (visitor) => visitor.trail ?? "" },
      { label: "Hiking Date", value: (visitor) => visitor.hiking_date },
      { label: "Booking Status", value: (visitor) => visitor.booking_status },
    ];

    const escapeCsv = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [
      columns.map((column) => escapeCsv(column.label)).join(","),
      ...filteredVisitors.map((visitor) =>
        columns.map((column) => escapeCsv(column.value(visitor))).join(",")
      ),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "e-pulag-visitors.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Employee Workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Visitor Records
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Search visitor information across direct reservations and package
            bookings, including hiking schedules and booking status.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCsv}
            disabled={loading || filteredVisitors.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => void fetchVisitors()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Visitors"
          value={counts.total}
          icon={<Users size={21} />}
          description="All recorded visitors"
        />
        <StatCard
          label="Direct Reservations"
          value={counts.direct}
          icon={<UserRound size={21} />}
          description="Direct booking records"
        />
        <StatCard
          label="Package Visitors"
          value={counts.package}
          icon={<ClipboardList size={21} />}
          description="Organizer package bookings"
        />
        <StatCard
          label="Approved Bookings"
          value={counts.approved}
          icon={<CalendarDays size={21} />}
          description="Visitors under approved bookings"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-950/[0.02] dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 p-5 dark:border-zinc-800 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                All Visitors
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {filteredVisitors.length.toLocaleString()} record
                {filteredVisitors.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="relative block sm:col-span-1">
                <span className="sr-only">Search visitor records</span>
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search visitors..."
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </label>

              <label>
                <span className="sr-only">Filter booking type</span>
                <select
                  value={sourceFilter}
                  onChange={(event) =>
                    setSourceFilter(event.target.value as "ALL" | "DIRECT" | "PACKAGE")
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                >
                  <option value="ALL">All booking types</option>
                  <option value="DIRECT">Direct reservations</option>
                  <option value="PACKAGE">Package bookings</option>
                </select>
              </label>

              <label>
                <span className="sr-only">Filter booking status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                >
                  <option value="ALL">All statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-zinc-500 dark:text-zinc-400">
            <RefreshCw size={18} className="animate-spin" />
            Loading visitor records...
          </div>
        ) : error ? (
          <div className="p-6">
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </div>
            <button
              type="button"
              onClick={() => void fetchVisitors()}
              className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Try again
            </button>
          </div>
        ) : filteredVisitors.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="rounded-2xl bg-zinc-100 p-4 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <Users size={28} />
            </div>
            <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">
              No visitors found
            </h3>
            <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
              Try changing your search or filters, or refresh to check for new records.
            </p>
            {(search || sourceFilter !== "ALL" || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSourceFilter("ALL");
                  setStatusFilter("ALL");
                }}
                className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-950/60">
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  {[
                    "Visitor",
                    "Booking reference",
                    "Trail",
                    "Hiking date",
                    "Type",
                    "Status",
                    "Details",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredVisitors.map((visitor) => (
                  <tr
                    key={`${visitor.source}-${visitor.id}`}
                    className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-zinc-900 dark:text-white">
                        {visitor.full_name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {[visitor.age ? `${visitor.age} years` : "", visitor.gender]
                          .filter(Boolean)
                          .join(" · ") || "Visitor"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-800 dark:text-zinc-200">
                        {visitor.booking_number}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {visitor.contact_number || "No contact number"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                      {visitor.trail || "Not assigned"}
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                      {formatDate(visitor.hiking_date)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          visitor.source === "DIRECT"
                            ? "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300"
                            : "bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300"
                        }`}
                      >
                        {visitor.source === "DIRECT" ? "Direct" : "Package"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(visitor.booking_status)}`}
                      >
                        {formatStatus(visitor.booking_status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedVisitor(visitor)}
                        className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-200 dark:hover:text-emerald-300"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedVisitor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedVisitor(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="visitor-details-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Visitor information
                </p>
                <h2
                  id="visitor-details-title"
                  className="mt-2 text-xl font-bold text-zinc-900 dark:text-white"
                >
                  {selectedVisitor.full_name}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {selectedVisitor.booking_number}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVisitor(null)}
                aria-label="Close visitor details"
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              {[
                ["Age", selectedVisitor.age ?? "Not provided"],
                ["Gender", selectedVisitor.gender || "Not provided"],
                ["Nationality", selectedVisitor.nationality || "Not provided"],
                ["Contact number", selectedVisitor.contact_number || "Not provided"],
                ["Address", selectedVisitor.address || "Not provided"],
                ["Emergency contact", selectedVisitor.emergency_contact || "Not provided"],
                ["Emergency number", selectedVisitor.emergency_number || "Not provided"],
                ["Trail", selectedVisitor.trail || "Not assigned"],
                ["Hiking date", formatDate(selectedVisitor.hiking_date)],
                ["Booking status", formatStatus(selectedVisitor.booking_status)],
                ["Booking type", selectedVisitor.source === "DIRECT" ? "Direct reservation" : "Package booking"],
                ["Booking reference", selectedVisitor.booking_number],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {label}
                  </p>
                  <p className="mt-1 break-words text-sm font-medium text-zinc-900 dark:text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end border-t border-zinc-200 p-5 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedVisitor(null)}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
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
