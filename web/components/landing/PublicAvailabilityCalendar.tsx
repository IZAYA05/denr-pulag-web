"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, CircleCheck, CircleX } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

type AvailabilityDay = {
  date: string;
  current_capacity: number;
  maximum_capacity: number;
  remaining_capacity: number;
  is_full: boolean;
  is_blocked: boolean;
  blocked_reason?: string | null;
  is_available: boolean;
};

type AvailabilityResponse = {
  availability?: AvailabilityDay[];
  message?: string;
};

function manilaToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function dateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function PublicAvailabilityCalendar() {
  const today = manilaToday();
  const minimumDate = dateString(new Date(
    parseDate(today).getFullYear(),
    parseDate(today).getMonth(),
    parseDate(today).getDate() + 30
  ));
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const minimum = parseDate(minimumDate);
    return new Date(minimum.getFullYear(), minimum.getMonth(), 1);
  });
  const [availability, setAvailability] = useState<Record<string, AvailabilityDay>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const monthStart = useMemo(
    () => dateString(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)),
    [visibleMonth]
  );
  const monthEnd = useMemo(
    () => dateString(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0)),
    [visibleMonth]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadAvailability() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ from: monthStart, to: monthEnd });
        const response = await fetch(
          `${API_URL}/api/booking-availability?${params.toString()}`,
          { cache: "no-store", signal: controller.signal, headers: { Accept: "application/json" } }
        );
        const data = (await response.json()) as AvailabilityResponse;
        if (!response.ok) throw new Error(data.message || "Unable to load availability.");
        const next: Record<string, AvailabilityDay> = {};
        for (const day of data.availability || []) next[day.date] = day;
        setAvailability(next);
      } catch (caught) {
        if (caught instanceof Error && caught.name === "AbortError") return;
        setError(caught instanceof Error ? caught.message : "Unable to load availability.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadAvailability();
    return () => controller.abort();
  }, [monthStart, monthEnd]);

  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const firstWeekday = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const earliestMonth = new Date(parseDate(minimumDate).getFullYear(), parseDate(minimumDate).getMonth(), 1);
  const previousMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  const canGoPrevious = previousMonth >= earliestMonth;

  return (
    <section
      aria-label="Mount Pulag date availability"
      className="w-full max-w-[430px] rounded-3xl border border-white/10 bg-zinc-900/90 p-5 text-white shadow-2xl shadow-black/30 backdrop-blur-xl"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Hiking Date Availability</h2>
          <p className="text-xs text-zinc-400">Check dates before making a reservation</p>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{monthLabel(visibleMonth)}</h3>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous month"
            disabled={!canGoPrevious || loading}
            onClick={() => setVisibleMonth(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
            className="rounded-lg p-2 text-zinc-300 transition hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            disabled={loading}
            onClick={() => setVisibleMonth(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
            className="rounded-lg p-2 text-zinc-300 transition hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="py-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{day}</div>
        ))}
        {cells.map((day, index) => {
          if (day === null) return <div key={`empty-${index}`} className="h-10" />;
          const value = dateString(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day));
          const data = availability[value];
          const beforeLeadTime = value < minimumDate;
          const unavailable = beforeLeadTime || Boolean(data && (!data.is_available || data.is_blocked || data.is_full));
          const pending = !beforeLeadTime && !data;
          const available = !unavailable && !pending;
          const label = beforeLeadTime
            ? "Booking opens 30 days before hiking date"
            : data?.is_blocked
              ? data.blocked_reason || "Unavailable: blocked by DENR"
              : data?.is_full
                ? "Unavailable: visitor capacity reached"
                : pending
                  ? "Availability is loading"
                  : "Available";
          return (
            <div
              key={value}
              title={`${value}: ${label}`}
              aria-label={`${value}: ${label}`}
              className={`flex h-10 flex-col items-center justify-center rounded-lg border text-xs ${
                available
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                  : pending
                    ? "border-zinc-700 bg-zinc-800/70 text-zinc-500"
                    : "border-rose-500/15 bg-rose-500/10 text-rose-300"
              }`}
            >
              <span>{day}</span>
              <span className={`mt-0.5 h-1 w-1 rounded-full ${available ? "bg-emerald-400" : pending ? "bg-zinc-500" : "bg-rose-400"}`} />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5"><CircleCheck className="h-3.5 w-3.5 text-emerald-400" /> Available</span>
        <span className="flex items-center gap-1.5"><CircleX className="h-3.5 w-3.5 text-rose-400" /> Unavailable</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-zinc-500" /> Checking</span>
      </div>
      <p className="mt-3 text-[11px] leading-5 text-zinc-500">
        Dates are subject to DENR restrictions and the 500-visitor daily limit. Booking opens at least 30 days before the hiking date.
      </p>
      {loading && <p className="mt-2 text-xs text-zinc-500">Updating calendar...</p>}
      {error && <p role="alert" className="mt-2 text-xs text-rose-300">{error}</p>}
    </section>
  );
}
