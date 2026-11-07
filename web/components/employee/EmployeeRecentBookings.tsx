"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  RefreshCw,
} from "lucide-react";

import { useEmployeeDashboard } from "@/components/employee/EmployeeDashboardClient";

type Booking = {
  id: number;
  type: "DIRECT" | "PACKAGE";
  booking_number?: string | null;
  group_leader_name?: string | null;
  hiking_date: string;
  total_visitors?: number | null;
  status: string;
  denr_status?: string | null;
  created_at?: string;
  trail?: {
    name?: string | null;
  } | null;
  customer?: {
    name?: string | null;
    full_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  package?: {
    name?: string | null;
    title?: string | null;
  } | null;
};

type BookingsResponse = {
  direct_reservations?: Booking[];
  package_bookings?: Booking[];
  message?: string;
};

type StatusItem = {
  key: string;
  label: string;
  style: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

function normalizeStatus(status?: string | null) {
  return (status || "").trim().toUpperCase();
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

function getBookingName(booking: Booking) {
  if (booking.type === "DIRECT") {
    return booking.group_leader_name || "Unknown group leader";
  }

  const customer = booking.customer;

  if (customer) {
    const name =
      customer.name ||
      customer.full_name ||
      [customer.first_name, customer.last_name]
        .filter(Boolean)
        .join(" ");

    if (name) return name;
  }

  return "Unknown customer";
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusStyle(label: string) {
  switch (label) {
    case "DENR Approved":
    case "Organizer Approved":
    case "Completed":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300";

    case "Awaiting Organizer":
      return "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300";

    case "Awaiting DENR":
      return "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300";

    case "DENR Rejected":
    case "Organizer Rejected":
    case "Rejected":
      return "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300";

    case "Cancelled":
      return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

    default:
      return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
  }
}

function getBookingStatuses(booking: Booking): StatusItem[] {
  const organizerStatus = normalizeStatus(booking.status);
  const denrStatus = normalizeStatus(booking.denr_status);

  if (booking.type === "DIRECT") {
    let label: string;

    switch (organizerStatus) {
      case "PENDING":
        label = "Awaiting DENR";
        break;
      case "APPROVED":
        label = "DENR Approved";
        break;
      case "REJECTED":
        label = "Rejected";
        break;
      case "CANCELLED":
        label = "Cancelled";
        break;
      case "COMPLETED":
        label = "Completed";
        break;
      default:
        label = formatStatus(organizerStatus || "Status unavailable");
    }

    return [
      {
        key: "direct-status",
        label,
        style: getStatusStyle(label),
      },
    ];
  }

  let organizerLabel: string;

  switch (organizerStatus) {
    case "PENDING":
      organizerLabel = "Awaiting Organizer";
      break;
    case "APPROVED":
      organizerLabel = "Organizer Approved";
      break;
    case "REJECTED":
      organizerLabel = "Organizer Rejected";
      break;
    case "CANCELLED":
      organizerLabel = "Cancelled";
      break;
    case "COMPLETED":
      organizerLabel = "Completed";
      break;
    default:
      organizerLabel = formatStatus(
        organizerStatus || "Status unavailable"
      );
  }

  const statuses: StatusItem[] = [
    {
      key: "organizer-status",
      label: organizerLabel,
      style: getStatusStyle(organizerLabel),
    },
  ];

  if (organizerStatus === "APPROVED") {
    let denrLabel: string;

    switch (denrStatus) {
      case "PENDING":
        denrLabel = "Awaiting DENR";
        break;
      case "APPROVED":
        denrLabel = "DENR Approved";
        break;
      case "REJECTED":
        denrLabel = "DENR Rejected";
        break;
      default:
        denrLabel = "DENR Status Unavailable";
    }

    statuses.push({
      key: "denr-status",
      label: denrLabel,
      style: getStatusStyle(denrLabel),
    });
  }

  return statuses;
}

function StatusBadges({ booking }: { booking: Booking }) {
  const statuses = getBookingStatuses(booking);

  return (
    <div className="flex flex-wrap gap-1.5">
      {statuses.map((status) => (
        <span
          key={status.key}
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${status.style}`}
        >
          {status.label}
        </span>
      ))}
    </div>
  );
}

export default function EmployeeRecentBookings() {
  const { accessToken } = useEmployeeDashboard();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchRecentBookings() {
      if (!accessToken) {
        setBookings([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/employee/bookings`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data: BookingsResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load recent bookings."
          );
        }

        const direct = (data.direct_reservations || []).map(
          (booking) => ({
            ...booking,
            type: "DIRECT" as const,
          })
        );

        const packages = (data.package_bookings || []).map(
          (booking) => ({
            ...booking,
            type: "PACKAGE" as const,
          })
        );

        const combined = [...direct, ...packages];

        const hasAllTimestamps =
          combined.length > 0 &&
          combined.every((booking) => Boolean(booking.created_at));

        if (hasAllTimestamps) {
          combined.sort(
            (a, b) =>
              new Date(b.created_at!).getTime() -
              new Date(a.created_at!).getTime()
          );
        } else {
          combined.sort(
            (a, b) =>
              new Date(a.hiking_date).getTime() -
              new Date(b.hiking_date).getTime()
          );
        }

        setBookings(combined.slice(0, 5));
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load recent bookings."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchRecentBookings();

    return () => controller.abort();
  }, [accessToken]);

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-950/[0.02] dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList
              size={20}
              className="text-emerald-600 dark:text-emerald-400"
            />

            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Recent Bookings
            </h2>
          </div>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Overview of direct reservations and package bookings.
          </p>
        </div>

        <Link
          href="/employee/bookings"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-200 dark:hover:text-emerald-400"
        >
          View All Bookings
          <ArrowRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 px-6 py-14 text-sm text-zinc-500 dark:text-zinc-400">
          <RefreshCw size={18} className="animate-spin" />
          Loading recent bookings...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="px-6 py-10 text-center text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <div className="rounded-2xl bg-zinc-100 p-4 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <CalendarDays size={26} />
          </div>

          <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">
            No bookings yet
          </h3>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Recent reservation activity will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-950/60">
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  {[
                    "Booking Reference",
                    "Visitor / Customer",
                    "Trail",
                    "Hiking Date",
                    "Visitors",
                    "Status",
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
                {bookings.map((booking) => (
                  <tr
                    key={`${booking.type}-${booking.id}`}
                    className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {booking.booking_number ||
                          `Booking #${booking.id}`}
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

                    <td className="px-5 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                      {getBookingName(booking)}
                    </td>

                    <td className="px-5 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                      {booking.trail?.name || "Not assigned"}
                    </td>

                    <td className="px-5 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                      {formatDate(booking.hiking_date)}
                    </td>

                    <td className="px-5 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                      {booking.total_visitors ?? "Unavailable"}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadges booking={booking} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {bookings.map((booking) => (
              <div
                key={`${booking.type}-${booking.id}`}
                className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-all text-sm font-semibold text-zinc-900 dark:text-white">
                      {booking.booking_number ||
                        `Booking #${booking.id}`}
                    </p>

                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      {getBookingName(booking)}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <StatusBadges booking={booking} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Booking Type
                    </p>

                    <p className="mt-1 font-medium text-zinc-800 dark:text-zinc-200">
                      {booking.type === "DIRECT" ? "Direct" : "Package"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Hiking Date
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
                      {booking.total_visitors ?? "Unavailable"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
