"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import { useDashboard } from "@/components/admin/DashboardClient";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type ApiRecord = Record<string, unknown>;

type BookingStatus = {
  name: string;
  value: number;
  color: string;
};

type ApiResponse = {
  reservations?: unknown[];
  bookings?: unknown[];
  package_bookings?: unknown[];
  message?: string;
};

const STATUS_COLORS = {
  "Awaiting Organizer": "#F59E0B",
  "Awaiting DENR": "#0EA5E9",
  "DENR Approved": "#059669",
  Rejected: "#DC2626",
  Cancelled: "#71717A",
  Completed: "#6366F1",
};

const INITIAL_STATUS: BookingStatus[] = Object.entries(
  STATUS_COLORS
).map(([name, color]) => ({
  name,
  value: 0,
  color,
}));

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

function extractRecords(
  payload: unknown,
  keys: string[]
): ApiRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is ApiRecord =>
        typeof item === "object" && item !== null
    );
  }

  if (typeof payload !== "object" || payload === null) {
    return [];
  }

  const record = payload as Record<string, unknown>;

  for (const key of keys) {
    if (key in record) {
      const result = extractRecords(record[key], keys);

      if (result.length > 0 || Array.isArray(record[key])) {
        return result;
      }
    }
  }

  if ("data" in record) {
    return extractRecords(record.data, keys);
  }

  return [];
}

function getStatus(value: unknown): string {
  return String(value ?? "").trim().toUpperCase();
}

export default function StatusChart() {
  const { accessToken } = useDashboard();

  const [data, setData] =
    useState<BookingStatus[]>(INITIAL_STATUS);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchBookingStatuses() {
      if (!accessToken) {
        setData(INITIAL_STATUS);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const headers = {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        };

        const [reservationResponse, packageResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/admin/reservations`, {
              headers,
              cache: "no-store",
              signal: controller.signal,
            }),
            fetch(`${API_URL}/api/admin/package-bookings`, {
              headers,
              cache: "no-store",
              signal: controller.signal,
            }),
          ]);

        const [reservationPayload, packagePayload] =
          (await Promise.all([
            reservationResponse.json(),
            packageResponse.json(),
          ])) as [ApiResponse, ApiResponse];

        if (!reservationResponse.ok) {
          throw new Error(
            reservationPayload.message ||
              "Failed to load direct reservations."
          );
        }

        if (!packageResponse.ok) {
          throw new Error(
            packagePayload.message ||
              "Failed to load package bookings."
          );
        }

        const reservations = extractRecords(
          reservationPayload,
          ["reservations"]
        );

        const packageBookings = extractRecords(
          packagePayload,
          ["bookings", "package_bookings"]
        );

        const counts: Record<string, number> = {
          "Awaiting Organizer": 0,
          "Awaiting DENR": 0,
          "DENR Approved": 0,
          Rejected: 0,
          Cancelled: 0,
          Completed: 0,
        };

        // Direct reservations go directly to DENR review.
        for (const reservation of reservations) {
          const status = getStatus(reservation.status);

          switch (status) {
            case "PENDING":
              counts["Awaiting DENR"] += 1;
              break;

            case "APPROVED":
              counts["DENR Approved"] += 1;
              break;

            case "REJECTED":
              counts.Rejected += 1;
              break;

            case "CANCELLED":
              counts.Cancelled += 1;
              break;

            case "COMPLETED":
              counts.Completed += 1;
              break;
          }
        }

        // Package bookings require Organizer approval first,
        // followed by final DENR approval.
        for (const booking of packageBookings) {
          const status = getStatus(booking.status);
          const denrStatus = getStatus(booking.denr_status);

          if (status === "PENDING") {
            counts["Awaiting Organizer"] += 1;
          } else if (
            status === "REJECTED" ||
            denrStatus === "REJECTED"
          ) {
            counts.Rejected += 1;
          } else if (status === "CANCELLED") {
            counts.Cancelled += 1;
          } else if (status === "COMPLETED") {
            counts.Completed += 1;
          } else if (status === "APPROVED") {
            if (denrStatus === "APPROVED") {
              counts["DENR Approved"] += 1;
            } else if (
              denrStatus === "PENDING" ||
              !denrStatus
            ) {
              counts["Awaiting DENR"] += 1;
            }
          }
        }

        if (!controller.signal.aborted) {
          setData(
            Object.entries(STATUS_COLORS).map(
              ([name, color]) => ({
                name,
                color,
                value: counts[name] ?? 0,
              })
            )
          );
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load booking statuses."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchBookingStatuses();

    return () => controller.abort();
  }, [accessToken]);

  const chartData = data.filter((item) => item.value > 0);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-white/90 p-6 backdrop-blur-xl dark:bg-zinc-950/90">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Booking Status
        </h2>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Direct reservation and package booking approval stages.
        </p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex h-[340px] items-center justify-center text-sm text-zinc-500">
          Loading booking statuses...
        </div>
      ) : error ? (
        <div className="flex h-[340px] items-center justify-center text-center text-sm text-zinc-500">
          Booking status data is unavailable.
        </div>
      ) : total === 0 ? (
        <div className="flex h-[340px] flex-col items-center justify-center text-center">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            No booking records available
          </p>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Status distribution will appear when bookings are recorded.
          </p>
        </div>
      ) : (
        <>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={4}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                    />
                  ))}
                </Pie>

                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div
                  className="mx-auto mb-2 h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />

                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {item.name}
                </p>

                <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                  {item.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
