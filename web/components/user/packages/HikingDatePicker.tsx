"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

export type BookingCapacitySummary = {
  date: string;
  current_capacity: number;
  maximum_capacity: number;
  remaining_capacity: number;
  is_full: boolean;
  is_blocked: boolean;
  blocked_reason?: string | null;
  is_available?: boolean;
};

type AvailabilityResponse = {
  availability?: BookingCapacitySummary[];
  message?: string;
};

interface HikingDatePickerProps {
  date: string;
  minimumDate: string;
  apiBaseUrl: string;
  accessToken?: string;
  visitorCount: number;
  onDateChange: (date: string) => void;
  onCapacityChange: (summary: BookingCapacitySummary | null) => void;
}

function parseDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthRange(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    from: localDateString(first),
    to: localDateString(last),
  };
}

function getMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(date);
}

export default function HikingDatePicker({
  date,
  minimumDate,
  apiBaseUrl,
  accessToken,
  visitorCount,
  onDateChange,
  onCapacityChange,
}: HikingDatePickerProps) {
  const [summary, setSummary] = useState<BookingCapacitySummary | null>(null);
  const [availability, setAvailability] = useState<Record<string, BookingCapacitySummary>>({});
  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [error, setError] = useState("");
  const [calendarError, setCalendarError] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(() =>
    parseDate(date || minimumDate)
  );

  const range = useMemo(() => monthRange(visibleMonth), [visibleMonth]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMonthAvailability() {
      if (!accessToken) {
        setAvailability({});
        setCalendarLoading(false);
        setCalendarError("Sign in to view date availability.");
        return;
      }

      setCalendarLoading(true);
      setCalendarError("");

      try {
        const baseUrl = apiBaseUrl.replace(/\/+$/, "");
        const params = new URLSearchParams({ from: range.from, to: range.to });
        const response = await fetch(
          `${baseUrl}/api/booking-availability?${params.toString()}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
            signal: controller.signal,
          }
        );
        const data = (await response.json()) as AvailabilityResponse;

        if (!response.ok) {
          throw new Error(data.message || "Unable to load date availability.");
        }

        const nextAvailability: Record<string, BookingCapacitySummary> = {};
        for (const item of data.availability || []) {
          nextAvailability[item.date] = item;
        }
        setAvailability(nextAvailability);
      } catch (caught) {
        if (caught instanceof Error && caught.name === "AbortError") return;
        setCalendarError(
          caught instanceof Error ? caught.message : "Unable to load date availability."
        );
      } finally {
        if (!controller.signal.aborted) setCalendarLoading(false);
      }
    }

    void loadMonthAvailability();
    return () => controller.abort();
  }, [accessToken, apiBaseUrl, range.from, range.to]);

  useEffect(() => {
    if (!date) {
      const clearId = window.setTimeout(() => {
        setSummary(null);
        setError("");
        onCapacityChange(null);
      }, 0);
      return () => window.clearTimeout(clearId);
    }

    const controller = new AbortController();

    async function loadCapacity() {
      setLoading(true);
      setError("");
      setSummary(null);
      onCapacityChange(null);

      try {
        const baseUrl = apiBaseUrl.replace(/\/+$/, "");
        const response = await fetch(
          `${baseUrl}/api/booking-capacity?date=${encodeURIComponent(date)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            cache: "no-store",
            signal: controller.signal,
          }
        );
        const data = (await response.json()) as BookingCapacitySummary & { message?: string };

        if (!response.ok) {
          throw new Error(data.message || "Unable to retrieve booking capacity.");
        }

        setSummary(data);
        onCapacityChange(data);
      } catch (caught) {
        if (caught instanceof Error && caught.name === "AbortError") return;
        setSummary(null);
        onCapacityChange(null);
        setError(
          caught instanceof Error ? caught.message : "Unable to retrieve booking capacity."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadCapacity();
    return () => controller.abort();
  }, [date, apiBaseUrl, accessToken, onCapacityChange]);

  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0
  ).getDate();
  const firstWeekday = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1
  ).getDay();
  const calendarCells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const minimumMonth = parseDate(minimumDate);
  const previousMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() - 1,
    1
  );
  const canGoPrevious =
    previousMonth.getFullYear() > minimumMonth.getFullYear() ||
    (previousMonth.getFullYear() === minimumMonth.getFullYear() &&
      previousMonth.getMonth() >= minimumMonth.getMonth());

  const insufficientCapacity =
    summary !== null && visitorCount > summary.remaining_capacity;
  const selectedUnavailable =
    summary !== null &&
    (summary.is_blocked || summary.is_full || insufficientCapacity);

  return (
    <div className="sm:col-span-2">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Hiking date <span className="text-red-500">*</span>
      </label>

      <input
        type="date"
        required
        min={minimumDate}
        value={date}
        onChange={(event) => {
          const nextDate = event.target.value;
          onDateChange(nextDate);
          if (nextDate) setVisibleMonth(parseDate(nextDate));
        }}
        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      />

      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Select a date at least 30 days ahead. Green dates are available; red dates are blocked or have reached visitor capacity.
      </p>

      <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {getMonthTitle(visibleMonth)}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              aria-label="Previous month"
              disabled={!canGoPrevious || calendarLoading}
              onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next month"
              disabled={calendarLoading}
              onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const).map((day) => (
            <div key={day} className="py-1 text-[11px] font-semibold text-zinc-400">
              {day}
            </div>
          ))}
          {calendarCells.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-11" />;
            }

            const dayDate = new Date(
              visibleMonth.getFullYear(),
              visibleMonth.getMonth(),
              day
            );
            const dayString = localDateString(dayDate);
            const dayAvailability = availability[dayString];
            const beforeMinimum = dayString < minimumDate;
            const isBlocked = Boolean(dayAvailability?.is_blocked);
            const isFull = Boolean(dayAvailability?.is_full);
            const notEnoughForGroup =
              dayAvailability !== undefined &&
              visitorCount > dayAvailability.remaining_capacity;
            const unavailable = beforeMinimum || isBlocked || isFull || notEnoughForGroup;
            const selected = dayString === date;
            const statusTitle = beforeMinimum
              ? "Booking is not open yet"
              : isBlocked
                ? dayAvailability?.blocked_reason || "Blocked by DENR"
                : isFull
                  ? "Daily visitor capacity reached"
                  : notEnoughForGroup
                    ? "Not enough visitor slots for this group"
                    : dayAvailability
                      ? "Available"
                      : "Checking availability";

            return (
              <button
                key={dayString}
                type="button"
                disabled={unavailable || !dayAvailability}
                title={statusTitle}
                aria-label={`${dayString}: ${statusTitle}`}
                aria-pressed={selected}
                onClick={() => onDateChange(dayString)}
                className={`relative flex min-h-11 flex-col items-center justify-center rounded-lg border text-sm transition ${
                  selected
                    ? "border-emerald-600 bg-emerald-600 font-bold text-white"
                    : unavailable
                      ? "border-red-100 bg-red-50 text-red-400 dark:border-red-950 dark:bg-red-950/20 dark:text-red-400"
                      : "border-emerald-100 bg-emerald-50 text-emerald-800 hover:border-emerald-400 dark:border-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-300"
                }`}
              >
                <span>{day}</span>
                <span className={`mt-0.5 h-1 w-1 rounded-full ${
                  selected ? "bg-white" : unavailable ? "bg-red-500" : "bg-emerald-500"
                }`} />
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Available</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Unavailable / blocked</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-zinc-400" /> Before booking window</span>
        </div>
        {calendarLoading && <p className="mt-2 text-xs text-zinc-500">Updating calendar availability...</p>}
        {calendarError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{calendarError}</p>}
      </div>

      {loading && <p className="mt-2 text-sm text-zinc-500">Checking visitor capacity...</p>}
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {summary && (
        <div className="mt-3 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-700">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-zinc-800 dark:text-zinc-200">Selected date availability</p>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              selectedUnavailable
                ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
            }`}>
              {selectedUnavailable ? "Unavailable" : "Available"}
            </span>
          </div>
          {summary.is_blocked && (
            <p className="mb-2 font-medium text-red-600 dark:text-red-400">
              DENR has blocked this date{summary.blocked_reason ? `: ${summary.blocked_reason}` : "."}
            </p>
          )}
          <p className="font-medium text-zinc-800 dark:text-zinc-200">Daily visitor capacity</p>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            {summary.current_capacity} of {summary.maximum_capacity} visitors booked
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            {summary.remaining_capacity} slots remaining
          </p>
          {summary.is_full && (
            <p className="mt-2 font-medium text-red-600 dark:text-red-400">
              This hiking date has reached its 500-visitor limit.
            </p>
          )}
          {insufficientCapacity && !summary.is_full && !summary.is_blocked && (
            <p className="mt-2 font-medium text-red-600 dark:text-red-400">
              Not enough slots remain for your group of {visitorCount}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
