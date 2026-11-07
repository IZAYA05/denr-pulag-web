"use client";

import { useCallback, useEffect, useState } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { EventInput } from "@fullcalendar/core";

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

type BookingPresentation = {
  label: string;
  color: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

function normalizeStatus(value?: string | null) {
  return (value || "").trim().toUpperCase();
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

function getDirectPresentation(status: string): BookingPresentation {
  switch (normalizeStatus(status)) {
    case "APPROVED":
      return {
        label: "DENR Approved",
        color: "#059669",
      };

    case "PENDING":
      return {
        label: "Awaiting DENR",
        color: "#2563eb",
      };

    case "COMPLETED":
      return {
        label: "Completed",
        color: "#71717a",
      };

    default:
      return {
        label: normalizeStatus(status) || "Status unavailable",
        color: "#64748b",
      };
  }
}

function getPackagePresentation(
  organizerStatus: string,
  denrStatus?: string | null
): BookingPresentation {
  const organizer = normalizeStatus(organizerStatus);
  const denr = normalizeStatus(denrStatus);

  if (organizer === "PENDING") {
    return {
      label: "Awaiting Organizer",
      color: "#d97706",
    };
  }

  if (organizer === "COMPLETED") {
    return {
      label: "Completed",
      color: "#71717a",
    };
  }

  if (organizer === "APPROVED") {
    switch (denr) {
      case "APPROVED":
        return {
          label: "DENR Approved",
          color: "#059669",
        };

      case "PENDING":
        return {
          label: "Awaiting DENR",
          color: "#2563eb",
        };

      default:
        return {
          label: "DENR Status Unavailable",
          color: "#64748b",
        };
    }
  }

  return {
    label: organizer || "Status unavailable",
    color: "#64748b",
  };
}

export default function BookingCalendar() {
  const { accessToken } = useDashboard();

  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
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

      const directEvents: EventInput[] = directBookings
        .filter((booking) => {
          const status = normalizeStatus(booking.status);

          return status !== "CANCELLED" && status !== "REJECTED";
        })
        .filter((booking) => Boolean(booking.hiking_date))
        .map((booking) => {
          const status = normalizeStatus(booking.status);
          const presentation = getDirectPresentation(status);
          const participantCount = getParticipantCount(
            booking.total_participants,
            booking.participants
          );

          const trailName = booking.trail?.name || "Unknown trail";
          const participantText =
            participantCount === null
              ? "Participants unavailable"
              : `${participantCount} participants`;

          return {
            id: `direct-${booking.id}`,
            title: `Direct · ${trailName} · ${participantText}`,
            start: booking.hiking_date.slice(0, 10),
            allDay: true,
            backgroundColor: presentation.color,
            borderColor: presentation.color,
            extendedProps: {
              bookingType: "Direct Reservation",
              bookingNumber:
                booking.reservation_number || `Reservation #${booking.id}`,
              status,
              reviewStatus: presentation.label,
              trail: trailName,
              participantCount,
            },
          };
        });

      const packageEvents: EventInput[] = packageBookings
        .filter((booking) => {
          const organizerStatus = normalizeStatus(booking.status);
          const denrStatus = normalizeStatus(booking.denr_status);

          return (
            organizerStatus !== "CANCELLED" &&
            organizerStatus !== "REJECTED" &&
            denrStatus !== "REJECTED"
          );
        })
        .filter((booking) => Boolean(booking.hiking_date))
        .map((booking) => {
          const organizerStatus = normalizeStatus(booking.status);
          const denrStatus = normalizeStatus(booking.denr_status);
          const presentation = getPackagePresentation(
            organizerStatus,
            denrStatus
          );

          const participantCount = getParticipantCount(
            booking.tourist_count,
            booking.tourists
          );

          const trailName = booking.trail?.name || "Unknown trail";
          const participantText =
            participantCount === null
              ? "Tourists unavailable"
              : `${participantCount} tourists`;

          return {
            id: `package-${booking.id}`,
            title: `Package · ${trailName} · ${participantText}`,
            start: booking.hiking_date.slice(0, 10),
            allDay: true,
            backgroundColor: presentation.color,
            borderColor: presentation.color,
            extendedProps: {
              bookingType: "Package Booking",
              bookingNumber:
                booking.booking_number || `Package #${booking.id}`,
              organizerStatus,
              denrStatus: denrStatus || null,
              reviewStatus: presentation.label,
              trail: trailName,
              participantCount,
            },
          };
        });

      setEvents([...directEvents, ...packageEvents]);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load booking calendar."
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  return (
    <Card className="p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Booking Calendar
          </h3>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Direct reservations and package hiking schedules.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchBookings()}
          disabled={loading}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-80 items-center justify-center text-sm text-zinc-500">
          Loading booking schedules...
        </div>
      ) : !error && events.length === 0 ? (
        <div className="flex h-80 flex-col items-center justify-center text-center">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            No booking schedules available
          </p>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Actual hiking schedules will appear here when bookings are recorded.
          </p>
        </div>
      ) : !error ? (
        <>
          <div className="mb-4 flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              DENR Approved
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              Awaiting DENR
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
              Awaiting Organizer
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-500" />
              Completed / Status unavailable
            </span>
          </div>

          <div className="calendar-wrapper">
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              height="auto"
              events={events}
              editable={false}
              selectable={false}
              dayMaxEvents={true}
              weekends={true}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth",
              }}
            />
          </div>
        </>
      ) : null}
    </Card>
  );
}
