
"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CalendarOff, Plus, RefreshCw, Trash2 } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

type BlockedDate = {
  id: number;
  date: string;
  reason?: string | null;
};

type ApiResponse = {
  blocked_dates?: BlockedDate[];
  message?: string;
  errors?: Record<string, string | string[]>;
};

function getMessage(data: ApiResponse, fallback: string) {
  const firstError = Object.values(data.errors ?? {})
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .find((value): value is string => typeof value === "string");

  return firstError || data.message || fallback;
}

function getTodayManila() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getDateOffsetManila(days: number) {
  const today = getTodayManila();
  const [year, month, day] = today.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export default function BlockedDateManager() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBlockedDates = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      setError("Your session is missing an API access token. Please sign in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/blocked-dates`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(getMessage(data, "Unable to load blocked dates."));
      }

      setBlockedDates(
        Array.isArray(data.blocked_dates) ? data.blocked_dates : []
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load blocked dates."
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void Promise.resolve().then(loadBlockedDates);
  }, [loadBlockedDates]);

  async function addBlockedDate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken || !date) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/blocked-dates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          date,
          reason: reason.trim() || null,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(getMessage(data, "Unable to block this date."));
      }

      setDate("");
      setReason("");
      setSuccess("The date is now marked unavailable for new bookings.");

      await loadBlockedDates();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to block this date."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeBlockedDate(item: BlockedDate) {
    if (!accessToken) return;

    if (!window.confirm(`Remove the unavailable date ${item.date}?`)) return;

    setDeletingId(item.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/blocked-dates/${item.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(getMessage(data, "Unable to remove the blocked date."));
      }

      setSuccess(data.message || "Blocked date removed.");

      setBlockedDates((current) =>
        current.filter((entry) => entry.id !== item.id)
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to remove the blocked date."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-red-500/10 p-3 text-red-600 dark:text-red-400">
            <CalendarOff className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Unavailable Dates
            </h3>

            <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
              Dates within the next 30 days are automatically unavailable for
              booking. You can manually block dates starting 31 days from today
              for holidays, park closures, or DENR restrictions. Blocked dates
              are rejected by the booking API, not just hidden in the calendar.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => void loadBlockedDates()}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          {success}
        </div>
      )}

      <form
        onSubmit={addBlockedDate}
        className="mt-5 grid gap-3 md:grid-cols-[190px_minmax(0,1fr)_auto]"
      >
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Date
          <input
            type="date"
            required
            min={getDateOffsetManila(31)}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </label>

        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Reason / note
          <input
            type="text"
            maxLength={255}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. Public holiday, severe weather, park closure"
            className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </label>

        <div className="flex items-end">
          <Button
            type="submit"
            disabled={saving || !date}
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Block date"}
          </Button>
        </div>
      </form>

      <div className="mt-6 border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="font-semibold text-zinc-900 dark:text-white">
            Blocked date list
          </h4>

          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {blockedDates.length} unavailable
          </span>
        </div>

        {loading ? (
          <p className="py-5 text-sm text-zinc-500">
            Loading blocked dates...
          </p>
        ) : blockedDates.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
            No dates have been blocked. Add a date when the park is closed or
            reservations are not accepted.
          </p>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {blockedDates.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {item.date}
                  </p>

                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {item.reason || "No reason provided"}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="danger"
                  disabled={deletingId === item.id}
                  onClick={() => void removeBlockedDate(item)}
                  className="self-start sm:self-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deletingId === item.id ? "Removing..." : "Remove"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
