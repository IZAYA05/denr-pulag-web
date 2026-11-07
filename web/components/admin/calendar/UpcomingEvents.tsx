"use client";

import { useCallback, useEffect, useState } from "react";

import {
  CalendarDays,
  ClipboardList,
  RefreshCw,
  Mountain,
} from "lucide-react";

import Card from "@/components/ui/Card";
import { useDashboard } from "@/components/admin/DashboardClient";

type DirectBooking = {
  id: number;
  reservation_number?: string;
  hiking_date: string;
  status: string;
  total_participants?: number | null;
  participants?: unknown[];
  trail?: {
    name?: string;
  } | null;
};

type PackageBooking = {
  id: number;
  booking_number?: string;
  hiking_date: string;
  tourist_count?: number | null;
  total_visitors?: number | null;
  tourists?: unknown[];
  status: string;
  denr_status?: string | null;
  trail?: {
    name?: string;
  } | null;
};

type ApiResponse<T> = {
  reservations?: T[];
  bookings?: T[];
  message?: string;
};

type UpcomingEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  source: "DIRECT" | "PACKAGE";
  status: string;
  denrStatus?: string | null;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  if (!value) return "Date unavailable";

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeStatus(value?: string | null) {
  return (value || "").trim().toUpperCase();
}

function getStatus(booking: UpcomingEvent) {
  const status = normalizeStatus(booking.status);
  const denrStatus = normalizeStatus(booking.denrStatus);

  if (booking.source === "DIRECT") {
    switch (status) {
      case "PENDING":
        return "Awaiting DENR";
      case "APPROVED":
        return "DENR Approved";
      case "REJECTED":
        return "DENR Rejected";
      case "CANCELLED":
        return "Cancelled";
      case "COMPLETED":
        return "Completed";
      default:
        return status || "Status unavailable";
    }
  }

  switch (status) {
    case "PENDING":
      return "Awaiting Organizer";
    case "REJECTED":
      return "Organizer Rejected";
    case "CANCELLED":
      return "Cancelled";
    case "COMPLETED":
      return "Completed";
    case "APPROVED":
      switch (denrStatus) {
        case "PENDING":
          return "Awaiting DENR";
        case "APPROVED":
          return "DENR Approved";
        case "REJECTED":
          return "DENR Rejected";
        default:
          return "DENR Status Unavailable";
      }
    default:
      return status || "Status unavailable";
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case "DENR Approved":
    case "Completed":
      return "text-emerald-600 dark:text-emerald-400";

    case "DENR Rejected":
    case "Organizer Rejected":
    case "Cancelled":
      return "text-red-600 dark:text-red-400";

    case "Awaiting DENR":
      return "text-sky-600 dark:text-sky-400";

    case "Awaiting Organizer":
      return "text-amber-600 dark:text-amber-400";

    default:
      return "text-zinc-500 dark:text-zinc-400";
  }
}

function getParticipantCount(
  value?: number | null,
  fallbackArray?: unknown[]
): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (Array.isArray(fallbackArray)) {
    return fallbackArray.length;
  }

  return null;
}

function getDescription(
  trailName: string | undefined,
  count: number | null,
  participantLabel: string
) {
  const trail = trailName || "Unknown trail";

  if (count === null) {
    return trail;
  }

  return `${trail} · ${count.toLocaleString()} ${participantLabel}`;
}

export default function UpcomingEvents() {
  const { accessToken } = useDashboard();

  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = useCallback(async () => {
    if (!accessToken) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      const [directResponse, packageResponse] = await Promise.all([
        fetch(`${API_URL}/api/admin/reservations`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/admin/package-bookings`, {
          headers,
          cache: "no-store",
        }),
      ]);

      const [directData, packageData] = await Promise.all([
        directResponse.json() as Promise<ApiResponse<DirectBooking>>,
        packageResponse.json() as Promise<ApiResponse<PackageBooking>>,
      ]);

      if (!directResponse.ok) {
        throw new Error(
          directData.message || "Failed to load direct reservations."
        );
      }

      if (!packageResponse.ok) {
        throw new Error(
          packageData.message || "Failed to load package bookings."
        );
      }

      const directBookings = Array.isArray(directData.reservations)
        ? directData.reservations
        : [];

      const packageBookings = Array.isArray(packageData.bookings)
        ? packageData.bookings
        : [];

      const today = localDateString(new Date());

      const directEvents: UpcomingEvent[] = directBookings
        .filter((booking) => {
          const status = normalizeStatus(booking.status);
          const date = booking.hiking_date?.slice(0, 10);

          return (
            status !== "CANCELLED" &&
            status !== "REJECTED" &&
            Boolean(date) &&
            date >= today
          );
        })
        .map((booking) => ({
          id: `direct-${booking.id}`,
          title: booking.reservation_number || `Reservation #${booking.id}`,
          description: getDescription(
            booking.trail?.name,
            getParticipantCount(
              booking.total_participants,
              booking.participants
            ),
            "participants"
          ),
          date: booking.hiking_date.slice(0, 10),
          source: "DIRECT",
          status: normalizeStatus(booking.status),
        }));

      const packageEvents: UpcomingEvent[] = packageBookings
        .filter((booking) => {
          const status = normalizeStatus(booking.status);
          const denrStatus = normalizeStatus(booking.denr_status);
          const date = booking.hiking_date?.slice(0, 10);

          return (
            status !== "CANCELLED" &&
            status !== "REJECTED" &&
            denrStatus !== "REJECTED" &&
            Boolean(date) &&
            date >= today
          );
        })
        .map((booking) => ({
          id: `package-${booking.id}`,
          title: booking.booking_number || `Package #${booking.id}`,
          description: getDescription(
            booking.trail?.name,
            getParticipantCount(
              booking.tourist_count ?? booking.total_visitors,
              booking.tourists
            ),
            "tourists"
          ),
          date: booking.hiking_date.slice(0, 10),
          source: "PACKAGE",
          status: normalizeStatus(booking.status),
          denrStatus: booking.denr_status
            ? normalizeStatus(booking.denr_status)
            : null,
        }));

      const upcoming = [...directEvents, ...packageEvents]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 6);

      setEvents(upcoming);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load upcoming bookings."
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Upcoming Hikes
          </h3>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Nearest scheduled direct and package bookings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchEvents()}
          disabled={loading}
          aria-label="Refresh upcoming hikes"
          className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-zinc-500">
          Loading upcoming hikes...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
        >
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="rounded-2xl bg-zinc-100 p-3 text-zinc-500 dark:bg-zinc-800">
            <CalendarDays className="h-6 w-6" />
          </div>

          <p className="mt-3 font-medium text-zinc-800 dark:text-zinc-200">
            No upcoming hikes
          </p>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Future booking schedules will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {events.map((event) => {
            const Icon =
              event.source === "DIRECT" ? Mountain : ClipboardList;

            const status = getStatus(event);

            return (
              <div
                key={event.id}
                className="flex items-start gap-4"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    status === "DENR Approved" ||
                    status === "Completed"
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : status.includes("Rejected") ||
                          status === "Cancelled"
                        ? "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-zinc-900 dark:text-white">
                    {event.title}
                  </h4>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {event.description}
                  </p>

                  <p className="mt-2 text-xs font-medium text-zinc-400">
                    {formatDate(event.date)}
                  </p>

                  <p className={`mt-2 text-xs font-semibold ${getStatusStyle(status)}`}>
                    {status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
