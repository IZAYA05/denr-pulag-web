"use client";

import { useEffect, useState } from "react";

export type BookingCapacitySummary = {
  date: string;
  current_capacity: number;
  maximum_capacity: number;
  remaining_capacity: number;
  is_full: boolean;
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

export default function HikingDatePicker({
  date,
  minimumDate,
  apiBaseUrl,
  accessToken,
  visitorCount,
  onDateChange,
  onCapacityChange,
}: HikingDatePickerProps) {
  const [summary, setSummary] =
    useState<BookingCapacitySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!date) {
      setSummary(null);
      setError("");
      onCapacityChange(null);
      return;
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
              ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            },
            signal: controller.signal,
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to retrieve booking capacity.",
          );
        }

        const capacity = data as BookingCapacitySummary;

        setSummary(capacity);
        onCapacityChange(capacity);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setSummary(null);
        onCapacityChange(null);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to retrieve booking capacity.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCapacity();

    return () => controller.abort();
  }, [date, apiBaseUrl, accessToken, onCapacityChange]);

  const insufficientCapacity =
    summary !== null && visitorCount > summary.remaining_capacity;

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
        onChange={(event) => onDateChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      />

      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Hiking dates must be at least 30 days from today. Availability is
        shared across direct reservations and package bookings.
      </p>

      {loading && (
        <p className="mt-2 text-sm text-zinc-500">
          Checking visitor capacity...
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {summary && (
        <div className="mt-2 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-700">
          <p className="font-medium text-zinc-800 dark:text-zinc-200">
            Daily visitor capacity
          </p>

          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            {summary.current_capacity} of {summary.maximum_capacity} visitors
            booked
          </p>

          <p className="text-zinc-600 dark:text-zinc-400">
            {summary.remaining_capacity} slots remaining
          </p>

          {summary.is_full && (
            <p className="mt-2 font-medium text-red-600 dark:text-red-400">
              This hiking date has reached its 500-visitor limit.
            </p>
          )}

          {insufficientCapacity && !summary.is_full && (
            <p className="mt-2 font-medium text-red-600 dark:text-red-400">
              Not enough slots remain for your group of {visitorCount}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}