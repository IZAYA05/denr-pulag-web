"use client";

import { useEffect, useState } from "react";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import Card from "@/components/ui/Card";
import { useDashboard } from "@/components/admin/DashboardClient";

type ApiRecord = Record<string, unknown>;

type StatusItem = {
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

const STATUS_COLORS: Record<string, string> = {
  "Awaiting Organizer": "#F59E0B",
  "Awaiting DENR": "#0EA5E9",
  "DENR Approved": "#059669",
  Rejected: "#DC2626",
  Cancelled: "#71717A",
  Completed: "#6366F1",
  "Status Unavailable": "#A1A1AA",
};

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

function normalizeStatus(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
}

function createEmptyCounts() {
  return {
    "Awaiting Organizer": 0,
    "Awaiting DENR": 0,
    "DENR Approved": 0,
    Rejected: 0,
    Cancelled: 0,
    Completed: 0,
    "Status Unavailable": 0,
  };
}

export default function StatusChart() {
  const { accessToken } = useDashboard();

  const [data, setData] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStatuses() {
      if (!accessToken) {
        setData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_LARAVEL_API_URL ||
          "http://localhost:18000";

        const headers = {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        };

        const [reservationResponse, packageResponse] =
          await Promise.all([
            fetch(`${apiBaseUrl}/api/admin/reservations`, {
              headers,
              cache: "no-store",
              signal: controller.signal,
            }),
            fetch(`${apiBaseUrl}/api/admin/package-bookings`, {
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

        const counts = createEmptyCounts();

        // Direct reservations go directly to DENR.
        for (const reservation of reservations) {
          const status = normalizeStatus(reservation.status);

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

            default:
              counts["Status Unavailable"] += 1;
          }
        }

        // Package bookings require Organizer approval first,
        // followed by the final DENR decision.
        for (const booking of packageBookings) {
          const organizerStatus = normalizeStatus(booking.status);
          const denrStatus = normalizeStatus(booking.denr_status);

          if (organizerStatus === "PENDING") {
            counts["Awaiting Organizer"] += 1;
          } else if (
            organizerStatus === "REJECTED" ||
            denrStatus === "REJECTED"
          ) {
            counts.Rejected += 1;
          } else if (organizerStatus === "CANCELLED") {
            counts.Cancelled += 1;
          } else if (organizerStatus === "COMPLETED") {
            counts.Completed += 1;
          } else if (organizerStatus === "APPROVED") {
            if (denrStatus === "APPROVED") {
              counts["DENR Approved"] += 1;
            } else if (denrStatus === "PENDING") {
              counts["Awaiting DENR"] += 1;
            } else {
              counts["Status Unavailable"] += 1;
            }
          } else {
            counts["Status Unavailable"] += 1;
          }
        }

        if (!controller.signal.aborted) {
          setData(
            Object.entries(counts)
              .filter(([, value]) => value > 0)
              .map(([name, value]) => ({
                name,
                value,
                color: STATUS_COLORS[name],
              }))
          );
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setData([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load booking statuses."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchStatuses();

    return () => controller.abort();
  }, [accessToken]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Booking Status
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Distribution of direct reservations and package booking decisions.
        </p>
      </div>

      {loading ? (
        <div className="flex h-80 items-center justify-center text-sm text-zinc-500">
          Loading booking statuses...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="flex h-80 items-center justify-center text-center text-sm text-red-500"
        >
          {error}
        </div>
      ) : total === 0 ? (
        <div className="flex h-80 flex-col items-center justify-center text-center">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">
            No booking records available
          </p>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Status distribution will appear when bookings are recorded.
          </p>
        </div>
      ) : (
        <>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {data.map((entry) => (
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

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div
                  className="mx-auto mb-2 h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />

                <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
