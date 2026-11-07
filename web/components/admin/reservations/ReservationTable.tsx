"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { useDashboard } from "@/components/admin/DashboardClient";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";

type ReservationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

type Reservation = {
  id: number;
  reservation_number: string;
  group_leader_name: string;
  hiking_date: string;
  status: ReservationStatus;
  total_participants?: number;
  participants_count?: number;
  participants?: { id: number }[];
  trail?: {
    id?: number;
    name: string;
  } | null;
};

type ApiResponse = {
  reservations?: Reservation[];
  message?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

const PAGE_SIZE = 10;

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getBadgeVariant(status: ReservationStatus) {
  switch (status) {
    case "APPROVED":
    case "COMPLETED":
      return "success" as const;

    case "PENDING":
      return "warning" as const;

    default:
      return "danger" as const;
  }
}

function getParticipantCount(reservation: Reservation) {
  return (
    reservation.total_participants ??
    reservation.participants_count ??
    reservation.participants?.length ??
    0
  );
}

function formatDate(date: string) {
  if (!date) return "Not specified";

  const parsedDate = new Date(`${date.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function csvCell(value: unknown) {
  let text = String(value ?? "");

  // Prevent spreadsheet formula execution in exported text fields.
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

export default function ReservationTable() {
  const { accessToken } = useDashboard();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [trailFilter, setTrailFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReservations = useCallback(
    async (signal?: AbortSignal) => {
      if (!accessToken) {
        setReservations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/admin/reservations`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
            cache: "no-store",
            signal,
          }
        );

        const data: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load reservations."
          );
        }

        if (!signal?.aborted) {
          setReservations(
            Array.isArray(data.reservations)
              ? data.reservations
              : []
          );
          setCurrentPage(1);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load reservations."
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

    void fetchReservations(controller.signal);

    return () => controller.abort();
  }, [fetchReservations]);

  const trails = useMemo(() => {
    return Array.from(
      new Set(
        reservations
          .map((reservation) => reservation.trail?.name)
          .filter((name): name is string => Boolean(name))
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reservations.filter((reservation) => {
      const matchesSearch =
        !query ||
        reservation.reservation_number?.toLowerCase().includes(query) ||
        reservation.group_leader_name?.toLowerCase().includes(query) ||
        String(reservation.id).includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        reservation.status === statusFilter;

      const matchesTrail =
        trailFilter === "ALL" ||
        reservation.trail?.name === trailFilter;

      const matchesDate =
        !dateFilter ||
        reservation.hiking_date?.slice(0, 10) === dateFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesTrail &&
        matchesDate
      );
    });
  }, [reservations, search, statusFilter, trailFilter, dateFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReservations.length / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedReservations = filteredReservations.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE
  );

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    trailFilter !== "ALL" ||
    dateFilter !== "";

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setTrailFilter("ALL");
    setDateFilter("");
    setCurrentPage(1);
  }

  function exportReservations() {
    if (filteredReservations.length === 0) return;

    const headers = [
      "Reservation Number",
      "Group Leader",
      "Trail",
      "Hiking Date",
      "Participants",
      "Status",
    ];

    const rows = filteredReservations.map((reservation) => [
      reservation.reservation_number,
      reservation.group_leader_name,
      reservation.trail?.name || "Not assigned",
      reservation.hiking_date,
      getParticipantCount(reservation),
      reservation.status,
    ]);

    const csv = [
      headers.map(csvCell).join(","),
      ...rows.map((row) => row.map(csvCell).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `direct-reservations-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  }

  async function updateStatus(
    reservation: Reservation,
    status: "APPROVED" | "REJECTED"
  ) {
    if (!accessToken || processingId !== null) return;

    const action = status === "APPROVED" ? "approve" : "reject";

    if (
      !window.confirm(
        `Are you sure you want to ${action} reservation ${reservation.reservation_number}?`
      )
    ) {
      return;
    }

    try {
      setProcessingId(reservation.id);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/reservations/${reservation.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update reservation."
        );
      }

      setReservations((current) =>
        current.map((item) =>
          item.id === reservation.id
            ? { ...item, status }
            : item
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update reservation."
      );
    } finally {
      setProcessingId(null);
    }
  }

  function goToPage(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Direct Reservations
          </h3>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Live reservation records from DENR.
          </p>
        </div>

        <Button
          onClick={() => void fetchReservations()}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Functional filters */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal
            size={18}
            className="text-emerald-600 dark:text-emerald-400"
          />

          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Filter Reservations
          </h4>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Booking ID or group leader..."
              aria-label="Search reservations"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by reservation status"
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={trailFilter}
            onChange={(event) => {
              setTrailFilter(event.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by trail"
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
          >
            <option value="ALL">All Trails</option>

            {trails.map((trail) => (
              <option key={trail} value={trail}>
                {trail}
              </option>
            ))}
          </select>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              type="date"
              value={dateFilter}
              onChange={(event) => {
                setDateFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by hiking date"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-700 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {filteredReservations.length.toLocaleString()} matching records
            {hasActiveFilters ? " · Filters applied" : ""}
          </p>

          <div className="flex flex-wrap gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <X size={15} />
                Clear Filters
              </button>
            )}

            <button
              type="button"
              onClick={exportReservations}
              disabled={filteredReservations.length === 0}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {/* Reservation table */}
      <div className="overflow-x-auto rounded-xl">
        <Table>
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr className="text-left">
              <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Booking ID
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Group Leader
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Trail
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Hiking Date
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Participants
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Status
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-sm text-zinc-500"
                >
                  Loading reservations...
                </td>
              </tr>
            ) : paginatedReservations.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-sm text-zinc-500"
                >
                  {reservations.length === 0
                    ? "No reservation records found."
                    : "No reservations match the selected filters."}
                </td>
              </tr>
            ) : (
              paginatedReservations.map((reservation) => {
                const processing = processingId === reservation.id;

                return (
                  <tr
                    key={reservation.id}
                    className="border-b border-zinc-100 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
                  >
                    <td className="px-6 py-5 font-medium text-zinc-900 dark:text-white">
                      {reservation.reservation_number ||
                        `Reservation #${reservation.id}`}
                    </td>

                    <td className="px-6 py-5 text-zinc-700 dark:text-zinc-300">
                      {reservation.group_leader_name || "Not specified"}
                    </td>

                    <td className="px-6 py-5 text-zinc-700 dark:text-zinc-300">
                      {reservation.trail?.name || "Not assigned"}
                    </td>

                    <td className="px-6 py-5 text-zinc-700 dark:text-zinc-300">
                      {formatDate(reservation.hiking_date)}
                    </td>

                    <td className="px-6 py-5 text-center text-zinc-700 dark:text-zinc-300">
                      {getParticipantCount(reservation)}
                    </td>

                    <td className="px-6 py-5 text-center">
                      <Badge variant={getBadgeVariant(reservation.status)}>
                        {formatStatus(reservation.status)}
                      </Badge>
                    </td>

                    <td className="px-6 py-5">
                      {reservation.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() =>
                              updateStatus(reservation, "APPROVED")
                            }
                            disabled={processingId !== null}
                            className="flex items-center gap-1 bg-green-600 px-3 py-2 text-xs text-white hover:bg-green-700"
                          >
                            <Check size={14} />
                            {processing ? "Processing..." : "Approve"}
                          </Button>

                          <Button
                            onClick={() =>
                              updateStatus(reservation, "REJECTED")
                            }
                            disabled={processingId !== null}
                            className="flex items-center gap-1 bg-red-600 px-3 py-2 text-xs text-white hover:bg-red-700"
                          >
                            <X size={14} />
                            {processing ? "Processing..." : "Reject"}
                          </Button>
                        </div>
                      ) : (
                        <p className="text-right text-xs text-zinc-400">
                          No action available
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      {/* Functional pagination */}
      {!loading && filteredReservations.length > 0 && (
        <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Showing{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">
              {(safeCurrentPage - 1) * PAGE_SIZE + 1}
              {"–"}
              {Math.min(
                safeCurrentPage * PAGE_SIZE,
                filteredReservations.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">
              {filteredReservations.length.toLocaleString()}
            </span>{" "}
            reservations
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              aria-label="Previous page"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter((page) => {
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - safeCurrentPage) <= 1
                );
              })
              .map((page, index, visiblePages) => {
                const previousPage = visiblePages[index - 1];
                const showEllipsis =
                  previousPage !== undefined &&
                  page - previousPage > 1;

                return (
                  <span key={page} className="flex items-center gap-2">
                    {showEllipsis && (
                      <span className="px-1 text-zinc-400">...</span>
                    )}

                    <button
                      type="button"
                      onClick={() => goToPage(page)}
                      aria-label={`Go to page ${page}`}
                      aria-current={
                        safeCurrentPage === page ? "page" : undefined
                      }
                      className={`h-10 min-w-10 rounded-xl border px-3 text-sm font-semibold transition ${
                        safeCurrentPage === page
                          ? "border-emerald-700 bg-emerald-700 text-white"
                          : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {page}
                    </button>
                  </span>
                );
              })}

            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              aria-label="Next page"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {filteredReservations.length.toLocaleString()} of{" "}
        {reservations.length.toLocaleString()} reservation records displayed.
      </p>
    </div>
  );
}
