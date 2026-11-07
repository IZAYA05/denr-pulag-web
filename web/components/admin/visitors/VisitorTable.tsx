"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, Users, X } from "lucide-react";

import { useDashboard } from "@/components/admin/DashboardClient";

type Visitor = {
  id: number;
  source: "DIRECT" | "PACKAGE";
  booking_id: number;
  booking_number: string;
  hiking_date: string;
  booking_status: string;
  denr_status?: string | null;
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

type ApiResponse = {
  visitors?: Visitor[];
  message?: string;
};

type OverallStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED"
  | "UNKNOWN";

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

function normalizeStatus(value?: string | null) {
  return (value || "").trim().toUpperCase();
}

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

function formatStatus(value?: string | null) {
  if (!value) return "Not started";

  return value
    .trim()
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusColor(value?: string | null) {
  switch (normalizeStatus(value)) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300";

    case "PENDING":
      return "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300";

    case "REJECTED":
      return "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300";

    case "CANCELLED":
      return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

    case "COMPLETED":
      return "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300";

    default:
      return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
  }
}

/**
 * Determines the overall booking status.
 *
 * Direct reservations go directly to DENR.
 * Package bookings require Organizer approval followed by DENR approval.
 */
function getOverallStatus(visitor: Visitor): OverallStatus {
  const bookingStatus = normalizeStatus(visitor.booking_status);

  if (visitor.source === "DIRECT") {
    switch (bookingStatus) {
      case "PENDING":
        return "PENDING";
      case "APPROVED":
        return "APPROVED";
      case "REJECTED":
        return "REJECTED";
      case "CANCELLED":
        return "CANCELLED";
      case "COMPLETED":
        return "COMPLETED";
      default:
        return "UNKNOWN";
    }
  }

  const denrStatus = normalizeStatus(visitor.denr_status);

  if (bookingStatus === "CANCELLED") return "CANCELLED";
  if (bookingStatus === "COMPLETED") return "COMPLETED";

  if (bookingStatus === "REJECTED" || denrStatus === "REJECTED") {
    return "REJECTED";
  }

  if (bookingStatus === "PENDING") return "PENDING";

  if (bookingStatus === "APPROVED") {
    if (denrStatus === "APPROVED") return "APPROVED";

    if (!denrStatus || denrStatus === "PENDING") {
      return "PENDING";
    }
  }

  return "UNKNOWN";
}

function StatusBadge({ value }: { value?: string | null }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor(value)}`}
    >
      {formatStatus(value)}
    </span>
  );
}

export default function VisitorTable() {
  const { accessToken } = useDashboard();

  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  const fetchVisitors = useCallback(
    async (signal?: AbortSignal) => {
      if (!accessToken) {
        setVisitors([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/admin/visitors`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
          signal,
        });

        const data: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load visitor records."
          );
        }

        if (!signal?.aborted) {
          setVisitors(
            Array.isArray(data.visitors) ? data.visitors : []
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
            : "Unable to load visitor records."
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

    void fetchVisitors(controller.signal);

    return () => controller.abort();
  }, [fetchVisitors]);

  useEffect(() => {
    if (!selectedVisitor) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedVisitor(null);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedVisitor]);

  const filteredVisitors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return visitors.filter((visitor) => {
      if (
        sourceFilter !== "ALL" &&
        visitor.source !== sourceFilter
      ) {
        return false;
      }

      if (
        statusFilter !== "ALL" &&
        getOverallStatus(visitor) !== statusFilter
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
        visitor.booking_id,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [visitors, search, sourceFilter, statusFilter]);

  const hasActiveFilters =
    search.trim() !== "" ||
    sourceFilter !== "ALL" ||
    statusFilter !== "ALL";

  function clearFilters() {
    setSearch("");
    setSourceFilter("ALL");
    setStatusFilter("ALL");
  }

  const detailItems: [string, string | number][] = selectedVisitor
    ? [
        ["Age", selectedVisitor.age ?? "Not provided"],
        ["Gender", selectedVisitor.gender || "Not provided"],
        ["Nationality", selectedVisitor.nationality || "Not provided"],
        ["Contact", selectedVisitor.contact_number || "Not provided"],
        ["Address", selectedVisitor.address || "Not provided"],
        [
          "Emergency Contact",
          selectedVisitor.emergency_contact || "Not provided",
        ],
        [
          "Emergency Number",
          selectedVisitor.emergency_number || "Not provided",
        ],
        ["Trail", selectedVisitor.trail || "Not assigned"],
        ["Hiking Date", formatDate(selectedVisitor.hiking_date)],
        [
          "Booking Type",
          selectedVisitor.source === "DIRECT"
            ? "Direct Reservation"
            : "Package Booking",
        ],
        [
          "Organizer Status",
          selectedVisitor.source === "PACKAGE"
            ? formatStatus(selectedVisitor.booking_status)
            : "N/A",
        ],
        [
          "DENR Status",
          formatStatus(
            selectedVisitor.source === "DIRECT"
              ? selectedVisitor.booking_status
              : selectedVisitor.denr_status
          ),
        ],
      ]
    : [];

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 p-5 dark:border-zinc-800 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Visitor Records
            </h2>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {filteredVisitors.length.toLocaleString()} visitor records found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search visitors..."
                aria-label="Search visitors"
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white sm:w-64"
              />
            </div>

            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              aria-label="Filter by booking type"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
            >
              <option value="ALL">All booking types</option>
              <option value="DIRECT">Direct reservations</option>
              <option value="PACKAGE">Package bookings</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by overall booking status"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending review</option>
              <option value="APPROVED">Fully approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <button
              type="button"
              onClick={() => void fetchVisitors()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Filters are applied to the visitor records.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-14 text-center text-sm text-zinc-500">
          Loading visitor records...
        </div>
      ) : error ? (
        <div className="p-6">
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
          >
            {error}
          </div>
        </div>
      ) : filteredVisitors.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <div className="rounded-2xl bg-zinc-100 p-4 text-zinc-500 dark:bg-zinc-800">
            <Users size={28} />
          </div>

          <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">
            No visitor records found
          </h3>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {visitors.length === 0
              ? "Visitor records will appear here when bookings are submitted."
              : "No visitors match the selected search or filters."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-950/60">
              <tr>
                {[
                  "Visitor",
                  "Booking Reference",
                  "Trail",
                  "Hiking Date",
                  "Type",
                  "Organizer",
                  "DENR",
                  "Details",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
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
                  className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-zinc-900 dark:text-white">
                      {visitor.full_name || "Name not provided"}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {visitor.age != null
                        ? `${visitor.age} years`
                        : "Age not provided"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {visitor.booking_number}
                  </td>

                  <td className="px-5 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                    {visitor.trail || "Not assigned"}
                  </td>

                  <td className="px-5 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                    {formatDate(visitor.hiking_date)}
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      {visitor.source === "DIRECT" ? "Direct" : "Package"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {visitor.source === "PACKAGE" ? (
                      <StatusBadge value={visitor.booking_status} />
                    ) : (
                      <span className="text-xs text-zinc-400">N/A</span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge
                      value={
                        visitor.source === "DIRECT"
                          ? visitor.booking_status
                          : visitor.denr_status
                      }
                    />
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedVisitor(visitor)}
                      className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 hover:border-emerald-500 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-200"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedVisitor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedVisitor(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="visitor-details-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
              <div>
                <h2
                  id="visitor-details-title"
                  className="text-xl font-bold text-zinc-900 dark:text-white"
                >
                  {selectedVisitor.full_name || "Visitor Details"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {selectedVisitor.booking_number}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close visitor details"
                onClick={() => setSelectedVisitor(null)}
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2">
              {detailItems.map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs font-medium uppercase text-zinc-500">
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
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
