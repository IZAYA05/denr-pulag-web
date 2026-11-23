
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
  blocked_dates?: T[];
  message?: string;
};

type BlockedDate = {
  id: number;
  date: string;
  reason?: string | null;
};

type BookingPresentation = {
  label: string;
  color: string;
};

const DAILY_CAPACITY = 500;
const CAPACITY_WARNING_THRESHOLD = 450;

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

/**
 * Converts a Date into a local YYYY-MM-DD string.
 * This avoids UTC conversion shifting calendar dates.
 */
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

      const [
        directResponse,
        packageResponse,
        blockedDatesResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/api/admin/reservations`, {
          headers,
          cache: "no-store",
        }),

        fetch(`${API_URL}/api/admin/package-bookings`, {
          headers,
          cache: "no-store",
        }),

        fetch(`${API_URL}/api/blocked-dates`, {
          headers,
          cache: "no-store",
        }),
      ]);

      const [
        directData,
        packageData,
        blockedDatesData,
      ] = await Promise.all([
        directResponse.json() as Promise<
          ApiResponse<DirectBooking>
        >,

        packageResponse.json() as Promise<
          ApiResponse<PackageBooking>
        >,

        blockedDatesResponse.json() as Promise<
          ApiResponse<BlockedDate>
        >,
      ]);

      if (!directResponse.ok) {
        throw new Error(
          directData.message ||
            "Failed to load direct reservations."
        );
      }

      if (!packageResponse.ok) {
        throw new Error(
          packageData.message ||
            "Failed to load package bookings."
        );
      }

      if (!blockedDatesResponse.ok) {
        throw new Error(
          blockedDatesData.message ||
            "Failed to load unavailable dates."
        );
      }

      const directBookings = Array.isArray(
        directData.reservations
      )
        ? directData.reservations
        : [];

      const packageBookings = Array.isArray(
        packageData.bookings
      )
        ? packageData.bookings
        : [];

      const directEvents: EventInput[] = directBookings
        .filter((booking) => {
          const status = normalizeStatus(booking.status);

          return (
            status !== "CANCELLED" &&
            status !== "REJECTED"
          );
        })
        .filter((booking) => Boolean(booking.hiking_date))
        .map((booking) => {
          const status = normalizeStatus(booking.status);
          const presentation = getDirectPresentation(status);

          const participantCount = getParticipantCount(
            booking.total_participants,
            booking.participants
          );

          const trailName =
            booking.trail?.name || "Unknown trail";

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
                booking.reservation_number ||
                `Reservation #${booking.id}`,
              status,
              reviewStatus: presentation.label,
              trail: trailName,
              participantCount,
            },
          };
        });

      const packageEvents: EventInput[] = packageBookings
        .filter((booking) => {
          const organizerStatus = normalizeStatus(
            booking.status
          );

          const denrStatus = normalizeStatus(
            booking.denr_status
          );

          return (
            organizerStatus !== "CANCELLED" &&
            organizerStatus !== "REJECTED" &&
            denrStatus !== "REJECTED"
          );
        })
        .filter((booking) => Boolean(booking.hiking_date))
        .map((booking) => {
          const organizerStatus = normalizeStatus(
            booking.status
          );

          const denrStatus = normalizeStatus(
            booking.denr_status
          );

          const presentation = getPackagePresentation(
            organizerStatus,
            denrStatus
          );

          const participantCount = getParticipantCount(
            booking.tourist_count,
            booking.tourists
          );

          const trailName =
            booking.trail?.name || "Unknown trail";

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
                booking.booking_number ||
                `Package #${booking.id}`,
              organizerStatus,
              denrStatus: denrStatus || null,
              reviewStatus: presentation.label,
              trail: trailName,
              participantCount,
            },
          };
        });

      const blockedDateEvents: EventInput[] = (
        Array.isArray(blockedDatesData.blocked_dates)
          ? blockedDatesData.blocked_dates
          : []
      ).map((blockedDate) => ({
        id: `blocked-${blockedDate.id}`,
        title: blockedDate.reason
          ? `Unavailable · ${blockedDate.reason}`
          : "Unavailable · DENR blocked date",
        start: blockedDate.date.slice(0, 10),
        allDay: true,
        backgroundColor: "#dc2626",
        borderColor: "#dc2626",
        extendedProps: {
          bookingType: "Unavailable Date",
          reason:
            blockedDate.reason || "No reason provided",
        },
      }));

      setEvents([
        ...directEvents,
        ...packageEvents,
        ...blockedDateEvents,
      ]);
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
    void Promise.resolve().then(fetchBookings);
  }, [fetchBookings]);

  /**
   * Aggregate the daily tourist count using the calendar events.
   *
   * Direct reservations and package bookings are both included.
   * Blocked dates are excluded.
   */
  const dailyCounts: Record<string, number> = {};

  events.forEach((event) => {
    const bookingType = event.extendedProps?.bookingType;

    if (
      bookingType === "Unavailable Date" ||
      !event.start
    ) {
      return;
    }

    const eventDate =
      typeof event.start === "string"
        ? event.start.slice(0, 10)
        : formatLocalDate(event.start as Date);

    const participantCount =
      event.extendedProps?.participantCount;

    if (
      typeof participantCount !== "number" ||
      !Number.isFinite(participantCount) ||
      participantCount <= 0
    ) {
      return;
    }

    dailyCounts[eventDate] =
      (dailyCounts[eventDate] || 0) + participantCount;
  });

  /**
   * Custom calendar day-cell content.
   * Displays the day number and the daily tourist total.
   */
  const renderDayCellContent = (arg: {
    date: Date;
    dayNumberText: string;
  }) => {
    const dateKey = formatLocalDate(arg.date);
    const count = dailyCounts[dateKey] || 0;

    let capacityColor =
      "text-zinc-500 dark:text-zinc-400";

    let capacityBackground =
      "bg-zinc-100 dark:bg-zinc-800";

    if (count >= DAILY_CAPACITY) {
      capacityColor =
        "text-red-700 dark:text-red-400";

      capacityBackground =
        "bg-red-100 dark:bg-red-950/50";
    } else if (
      count >= CAPACITY_WARNING_THRESHOLD
    ) {
      capacityColor =
        "text-amber-700 dark:text-amber-400";

      capacityBackground =
        "bg-amber-100 dark:bg-amber-950/50";
    } else if (count > 0) {
      capacityColor =
        "text-emerald-700 dark:text-emerald-400";

      capacityBackground =
        "bg-emerald-100 dark:bg-emerald-950/40";
    }

    return (
      <div className="flex w-full flex-col items-end gap-1">
        <span className="fc-day-number-custom">
          {arg.dayNumberText}
        </span>

        {count > 0 && (
          <span
            title={`${count} tourists out of ${DAILY_CAPACITY} daily capacity`}
            className={`inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-tight ${capacityColor} ${capacityBackground}`}
          >
            {count}/{DAILY_CAPACITY}
          </span>
        )}
      </div>
    );
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
          Booking Calendar
        </h3>

        <button
          type="button"
          onClick={() => void fetchBookings()}
          disabled={loading}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
          Loading...
        </div>
      ) : !error && events.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            No booking schedules
          </p>
        </div>
      ) : !error ? (
        <>
          <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
            {[
              ["DENR Approved", "bg-emerald-500"],
              ["Awaiting DENR", "bg-blue-500"],
              ["Awaiting Organizer", "bg-amber-500"],
              ["Completed / Other", "bg-zinc-500"],
              ["Blocked", "bg-red-500"],
            ].map(([label, color]) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${color}`}
                />
                {label}
              </span>
            ))}
          </div>

          {/* Daily Capacity Legend */}
          <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                100/500
              </span>
              Below capacity
            </span>

            <span className="inline-flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                450/500
              </span>
              Near capacity
            </span>

            <span className="inline-flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <span className="rounded-md bg-red-100 px-1.5 py-0.5 font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-400">
                500/500
              </span>
              Capacity reached
            </span>
          </div>

          <div className="epulag-calendar overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              height="auto"
              events={events}
              editable={false}
              selectable={false}
              dayMaxEvents={3}
              moreLinkClick="popover"
              weekends={true}
              dayCellContent={renderDayCellContent}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth",
              }}
              buttonText={{
                today: "Today",
                month: "Month",
              }}
            />
          </div>
        </>
      ) : null}

      <style jsx global>{`
        .epulag-calendar .fc {
          --fc-border-color: rgb(228 228 231);
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: rgb(244 244 245);
          --fc-today-bg-color: rgba(59, 130, 246, 0.08);
          color: rgb(63 63 70);
          font-size: 13px;
        }

        .dark .epulag-calendar .fc {
          --fc-border-color: rgb(63 63 70);
          --fc-neutral-bg-color: rgb(39 39 42);
          color: rgb(212 212 216);
        }

        .epulag-calendar .fc .fc-toolbar {
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem !important;
        }

        .epulag-calendar .fc .fc-toolbar-title {
          font-size: 1.15rem;
          font-weight: 600;
          color: rgb(24 24 27);
        }

        .dark .epulag-calendar .fc .fc-toolbar-title {
          color: rgb(244 244 245);
        }

        .epulag-calendar .fc .fc-button {
          border: 1px solid rgb(228 228 231) !important;
          border-radius: 0.5rem !important;
          background: rgb(250 250 250) !important;
          color: rgb(63 63 70) !important;
          box-shadow: none !important;
          font-weight: 500 !important;
          padding: 0.4rem 0.65rem !important;
          text-transform: none !important;
        }

        .dark .epulag-calendar .fc .fc-button {
          border-color: rgb(63 63 70) !important;
          background: rgb(39 39 42) !important;
          color: rgb(228 228 231) !important;
        }

        .epulag-calendar .fc .fc-button:hover {
          background: rgb(244 244 245) !important;
        }

        .dark .epulag-calendar .fc .fc-button:hover {
          background: rgb(63 63 70) !important;
        }

        .epulag-calendar .fc .fc-button:disabled {
          opacity: 0.45 !important;
        }

        .epulag-calendar .fc .fc-button-active {
          background: rgb(228 228 231) !important;
        }

        .dark .epulag-calendar .fc .fc-button-active {
          background: rgb(63 63 70) !important;
        }

        .epulag-calendar .fc .fc-col-header-cell {
          background: rgb(250 250 250);
          padding: 0.65rem 0;
        }

        .dark .epulag-calendar .fc .fc-col-header-cell {
          background: rgb(39 39 42);
        }

        .epulag-calendar .fc .fc-col-header-cell-cushion {
          color: rgb(82 82 91);
          font-weight: 600;
          text-decoration: none;
        }

        .dark .epulag-calendar .fc .fc-col-header-cell-cushion {
          color: rgb(212 212 216);
        }

        .epulag-calendar .fc .fc-daygrid-day-number {
          padding: 0.45rem;
          color: rgb(82 82 91);
          text-decoration: none;
        }

        .dark .epulag-calendar .fc .fc-daygrid-day-number {
          color: rgb(212 212 216);
        }

        .epulag-calendar .fc .fc-day-today {
          background: var(--fc-today-bg-color) !important;
        }

        .epulag-calendar .fc .fc-day-today .fc-daygrid-day-number {
          color: rgb(37 99 235);
          font-weight: 700;
        }

        .epulag-calendar .fc .fc-daygrid-day-frame {
          min-height: 6rem;
        }

        .epulag-calendar .fc .fc-daygrid-event {
          border-radius: 0.35rem;
          border-width: 0;
          margin: 2px 3px;
          padding: 1px 3px;
          font-size: 11px;
        }

        .epulag-calendar .fc .fc-event-title,
        .epulag-calendar .fc .fc-event-time {
          font-weight: 500;
        }

        .epulag-calendar .fc .fc-more-link {
          color: rgb(59 130 246);
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .epulag-calendar .fc .fc-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .epulag-calendar .fc .fc-toolbar-chunk {
            display: flex;
            justify-content: center;
          }

          .epulag-calendar .fc .fc-toolbar-title {
            font-size: 1rem;
          }

          .epulag-calendar .fc .fc-daygrid-day-frame {
            min-height: 4.25rem;
          }

          .epulag-calendar .fc .fc-daygrid-event {
            font-size: 10px;
          }
        }
      `}</style>
    </Card>
  );
}
