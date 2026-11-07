"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ClipboardList,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import { useEmployeeDashboard } from "@/components/employee/EmployeeDashboardClient";

type BookingStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

type DenrStatus = "PENDING" | "APPROVED" | "REJECTED" | null;

type Trail = {
  id?: number;
  name?: string | null;
} | null;

type Person = {
  id?: number;
  name?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  phone_number?: string;
};

type Booking = {
  id: number;
  type: "DIRECT" | "PACKAGE";
  booking_number: string;
  group_leader_name?: string | null;
  phone?: string | null;
  hiking_date: string;
  total_visitors: number;
  status: BookingStatus;
  denr_status?: DenrStatus;
  remarks?: string | null;
  trail?: Trail;
  user?: Person | null;
  customer?: Person | null;
  package?: {
    id?: number;
    name?: string | null;
    title?: string | null;
  } | null;
};

type BookingResponse = {
  direct_reservations?: Booking[];
  package_bookings?: Booking[];
  message?: string;
  booking?: Booking;
  reservation?: Booking;
};

type StatusFilter = "ALL" | BookingStatus;
type TypeFilter = "ALL" | "DIRECT" | "PACKAGE";

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

const statusStyles: Record<string, string> = {
  PENDING:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
  APPROVED:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  REJECTED:
    "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/20",
  CANCELLED:
    "bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
  COMPLETED:
    "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20",
};

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

function formatStatus(status: string) {
  const normalized = status.toLowerCase().replaceAll("_", " ");
  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getBookingName(booking: Booking) {
  if (booking.type === "DIRECT") {
    return booking.group_leader_name || "Unknown group leader";
  }

  const customer = booking.customer;

  const customerName = customer
    ? [
        customer.name,
        [customer.first_name, customer.last_name]
          .filter(Boolean)
          .join(" "),
        customer.full_name,
      ].find(Boolean)
    : undefined;

  return (
    customerName ||
    booking.package?.name ||
    booking.package?.title ||
    "Package customer"
  );
}

function getBookingSubtitle(booking: Booking) {
  if (booking.type === "DIRECT") {
    return booking.phone || booking.user?.email || "Direct reservation";
  }

  return booking.package?.name || booking.package?.title || "Package booking";
}

function getDenrStatus(booking: Booking): DenrStatus {
  if (booking.type !== "PACKAGE") return null;

  return booking.denr_status ?? null;
}

function getPackageOrganizerStatusLabel(booking: Booking) {
  switch (booking.status) {
    case "PENDING":
      return "Awaiting Organizer";

    case "APPROVED":
      return "Organizer Approved";

    case "REJECTED":
      return "Organizer Rejected";

    case "CANCELLED":
      return "Cancelled";

    case "COMPLETED":
      return "Completed";

    default:
      return formatStatus(booking.status);
  }
}

function getPackageDenrStatusLabel(booking: Booking) {
  const status = getDenrStatus(booking);

  if (booking.status !== "APPROVED") {
    return null;
  }

  switch (status) {
    case "PENDING":
      return "Awaiting DENR";

    case "APPROVED":
      return "DENR Approved";

    case "REJECTED":
      return "DENR Rejected";

    default:
      return "Awaiting DENR";
  }
}

function StatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        statusStyles[status] || statusStyles.PENDING
      }`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {label || formatStatus(status)}
    </span>
  );
}

function BookingStatusDisplay({ booking }: { booking: Booking }) {
  if (booking.type === "DIRECT") {
    return <StatusBadge status={booking.status} />;
  }

  const denrStatus = getDenrStatus(booking);

  return (
    <div className="flex flex-col items-start gap-2">
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
          Organizer
        </p>

        <StatusBadge
          status={booking.status}
          label={getPackageOrganizerStatusLabel(booking)}
        />
      </div>

      {booking.status === "APPROVED" && (
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
            DENR
          </p>

          <StatusBadge
            status={denrStatus || "PENDING"}
            label={getPackageDenrStatusLabel(booking) || "Awaiting DENR"}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
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
        </div>

        <div className={`rounded-xl p-3 ${accent}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function canDENRReview(booking: Booking) {
  if (booking.type === "DIRECT") {
    return booking.status === "PENDING";
  }

  return (
    booking.status === "APPROVED" &&
    booking.denr_status === "PENDING"
  );
}

function matchesStatusFilter(
  booking: Booking,
  filter: StatusFilter
) {
  if (filter === "ALL") return true;

  if (booking.type === "DIRECT") {
    return booking.status === filter;
  }

  switch (filter) {
    case "PENDING":
      return (
        booking.status === "PENDING" ||
        (booking.status === "APPROVED" &&
          booking.denr_status === "PENDING")
      );

    case "APPROVED":
      return (
        booking.status === "APPROVED" &&
        booking.denr_status === "APPROVED"
      );

    case "REJECTED":
      return (
        booking.status === "REJECTED" ||
        (booking.status === "APPROVED" &&
          booking.denr_status === "REJECTED")
      );

    case "CANCELLED":
      return booking.status === "CANCELLED";

    case "COMPLETED":
      return booking.status === "COMPLETED";

    default:
      return false;
  }
}

export default function EmployeeBookings() {
  const { accessToken } = useEmployeeDashboard();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");
  const [typeFilter, setTypeFilter] =
    useState<TypeFilter>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchBookings = useCallback(
    async (signal?: AbortSignal) => {
      if (!accessToken) {
        setBookings([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/api/employee/bookings`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal,
          cache: "no-store",
        });

        const data: BookingResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load bookings.");
        }

        const direct = (data.direct_reservations || []).map((booking) => ({
          ...booking,
          type: "DIRECT" as const,
        }));

        const packages = (data.package_bookings || []).map((booking) => ({
          ...booking,
          type: "PACKAGE" as const,
        }));

        setBookings(
          [...direct, ...packages].sort((a, b) => {
            const dateA = new Date(a.hiking_date).getTime();
            const dateB = new Date(b.hiking_date).getTime();

            return dateA - dateB;
          })
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load bookings."
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    const controller = new AbortController();

    void fetchBookings(controller.signal);

    return () => controller.abort();
  }, [fetchBookings]);

  const counts = useMemo(() => {
    const pendingDirect = bookings.filter(
      (booking) =>
        booking.type === "DIRECT" &&
        booking.status === "PENDING"
    );

    const pendingPackageDenr = bookings.filter(
      (booking) =>
        booking.type === "PACKAGE" &&
        booking.status === "APPROVED" &&
        booking.denr_status === "PENDING"
    );

    const approvedDirect = bookings.filter(
      (booking) =>
        booking.type === "DIRECT" &&
        booking.status === "APPROVED"
    );

    const approvedPackageDenr = bookings.filter(
      (booking) =>
        booking.type === "PACKAGE" &&
        booking.status === "APPROVED" &&
        booking.denr_status === "APPROVED"
    );

    return {
      total: bookings.length,
      pending: pendingDirect.length + pendingPackageDenr.length,
      approved: approvedDirect.length + approvedPackageDenr.length,
      direct: bookings.filter(
        (booking) => booking.type === "DIRECT"
      ).length,
      awaitingOrganizer: bookings.filter(
        (booking) =>
          booking.type === "PACKAGE" &&
          booking.status === "PENDING"
      ).length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      if (!matchesStatusFilter(booking, statusFilter)) return false;

      if (typeFilter !== "ALL" && booking.type !== typeFilter) {
        return false;
      }

      if (!query) return true;

      return [
        booking.booking_number,
        getBookingName(booking),
        getBookingSubtitle(booking),
        booking.trail?.name,
        booking.package?.name,
        booking.package?.title,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [bookings, search, statusFilter, typeFilter]);

  async function updateStatus(
    booking: Booking,
    status: "APPROVED" | "REJECTED"
  ) {
    if (!canDENRReview(booking)) return;

    if (!accessToken) {
      setActionError("Your session has expired. Please log in again.");
      return;
    }

    const key = `${booking.type}-${booking.id}`;

    setUpdatingId(key);
    setActionError("");
    setNotice("");

    const isDirect = booking.type === "DIRECT";

    const endpoint = isDirect
      ? `${API_URL}/api/admin/reservations/${booking.id}/status`
      : `${API_URL}/api/admin/package-bookings/${booking.id}/denr-status`;

    const requestBody = isDirect
      ? { status }
      : { denr_status: status };

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update booking status."
        );
      }

      const updatedBooking = data.booking || data.reservation;

      setBookings((current) =>
        current.map((item) => {
          if (item.type !== booking.type || item.id !== booking.id) {
            return item;
          }

          if (isDirect) {
            return {
              ...item,
              status,
            };
          }

          return {
            ...item,
            ...(updatedBooking
              ? {
                  denr_status: updatedBooking.denr_status,
                  status: updatedBooking.status,
                }
              : {
                  denr_status: status,
                }),
          };
        })
      );

      setNotice(
        isDirect
          ? `${booking.booking_number} was ${status.toLowerCase()} by DENR.`
          : `DENR has ${status.toLowerCase()} the hike for ${booking.booking_number}.`
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to update booking."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Employee Workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Bookings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Review direct reservations and Organizer-approved package
            bookings. DENR makes the final decision on whether each hike
            is permitted.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchBookings()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Bookings"
          value={counts.total}
          icon={<ClipboardList size={21} />}
          accent="bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
        />

        <StatCard
          label="Pending DENR Review"
          value={counts.pending}
          icon={<CalendarDays size={21} />}
          accent="bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"
        />

        <StatCard
          label="DENR Approved"
          value={counts.approved}
          icon={<Check size={21} />}
          accent="bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300"
        />

        <StatCard
          label="Direct Reservations"
          value={counts.direct}
          icon={<Users size={21} />}
          accent="bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300"
        />
      </section>

      {counts.awaitingOrganizer > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          {counts.awaitingOrganizer} package booking
          {counts.awaitingOrganizer === 1 ? " is" : "s are"} still
          awaiting Organizer approval. These will appear in DENR's
          review queue once approved by their respective Organizers.
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          {notice}
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {actionError}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-950/[0.02] dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 p-5 dark:border-zinc-800 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                All Bookings
              </h2>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {filteredBookings.length} result
                {filteredBookings.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="relative block sm:col-span-1">
                <span className="sr-only">Search bookings</span>

                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search bookings..."
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </label>

              <label>
                <span className="sr-only">Filter booking type</span>

                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(event.target.value as TypeFilter)
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                >
                  <option value="ALL">All types</option>
                  <option value="DIRECT">Direct reservations</option>
                  <option value="PACKAGE">Package bookings</option>
                </select>
              </label>

              <label>
                <span className="sr-only">Filter booking status</span>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                >
                  <option value="ALL">All statuses</option>
                  <option value="PENDING">Pending review</option>
                  <option value="APPROVED">DENR approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-zinc-500 dark:text-zinc-400">
            <RefreshCw size={18} className="animate-spin" />
            Loading bookings...
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
              onClick={() => void fetchBookings()}
              className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Try again
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="rounded-2xl bg-zinc-100 p-4 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <ClipboardList size={28} />
            </div>

            <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">
              No bookings found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
              Try changing your search or filters, or refresh to check
              for new bookings.
            </p>

            {(search ||
              statusFilter !== "ALL" ||
              typeFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setTypeFilter("ALL");
                }}
                className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-950/60">
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    {[
                      "Booking",
                      "Group leader / customer",
                      "Trail",
                      "Hiking date",
                      "Visitors",
                      "Approval status",
                      "Actions",
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
                  {filteredBookings.map((booking) => {
                    const key = `${booking.type}-${booking.id}`;
                    const isUpdating = updatingId === key;
                    const canUpdate = canDENRReview(booking);

                    return (
                      <tr
                        key={key}
                        className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {booking.booking_number}
                          </p>

                          <span
                            className={`mt-1 inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                              booking.type === "DIRECT"
                                ? "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300"
                                : "bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300"
                            }`}
                          >
                            {booking.type === "DIRECT" ? "Direct" : "Package"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            {getBookingName(booking)}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {getBookingSubtitle(booking)}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                          {booking.trail?.name || "Not assigned"}
                        </td>

                        <td className="px-5 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                          {formatDate(booking.hiking_date)}
                        </td>

                        <td className="px-5 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                          {booking.total_visitors}
                        </td>

                        <td className="px-5 py-4">
                          <BookingStatusDisplay booking={booking} />
                        </td>

                        <td className="px-5 py-4">
                          {canUpdate ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                title="Approve hike"
                                aria-label={`Approve ${booking.booking_number}`}
                                disabled={isUpdating || updatingId !== null}
                                onClick={() =>
                                  void updateStatus(booking, "APPROVED")
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                              >
                                <Check size={14} />
                                {isUpdating ? "Saving..." : "Approve Hike"}
                              </button>

                              <button
                                type="button"
                                title="Reject hike"
                                aria-label={`Reject ${booking.booking_number}`}
                                disabled={isUpdating || updatingId !== null}
                                onClick={() =>
                                  void updateStatus(booking, "REJECTED")
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                              >
                                <X size={14} />
                                Reject Hike
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400">
                              {booking.type === "PACKAGE" &&
                              booking.status === "PENDING"
                                ? "Awaiting Organizer"
                                : booking.type === "PACKAGE" &&
                                    booking.status === "REJECTED"
                                  ? "Rejected by Organizer"
                                  : "No action"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {filteredBookings.map((booking) => {
                const key = `${booking.type}-${booking.id}`;
                const isUpdating = updatingId === key;
                const canUpdate = canDENRReview(booking);

                return (
                  <article
                    key={key}
                    className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-all font-semibold text-zinc-900 dark:text-white">
                          {booking.booking_number}
                        </p>

                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                          {getBookingName(booking)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <BookingStatusDisplay booking={booking} />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Booking type
                        </p>

                        <p className="mt-1 font-medium text-zinc-800 dark:text-zinc-200">
                          {booking.type === "DIRECT" ? "Direct" : "Package"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Hiking date
                        </p>

                        <p className="mt-1 font-medium text-zinc-800 dark:text-zinc-200">
                          {formatDate(booking.hiking_date)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Trail
                        </p>

                        <p className="mt-1 font-medium text-zinc-800 dark:text-zinc-200">
                          {booking.trail?.name || "Not assigned"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Visitors
                        </p>

                        <p className="mt-1 font-medium text-zinc-800 dark:text-zinc-200">
                          {booking.total_visitors}
                        </p>
                      </div>
                    </div>

                    {canUpdate && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={isUpdating || updatingId !== null}
                          onClick={() =>
                            void updateStatus(booking, "APPROVED")
                          }
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          <Check size={15} />
                          {isUpdating ? "Saving..." : "Approve Hike"}
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating || updatingId !== null}
                          onClick={() =>
                            void updateStatus(booking, "REJECTED")
                          }
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200 disabled:opacity-50"
                        >
                          <X size={15} />
                          Reject Hike
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
