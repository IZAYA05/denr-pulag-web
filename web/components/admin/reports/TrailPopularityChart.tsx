"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useDashboard } from "@/components/admin/DashboardClient";
import Card from "@/components/ui/Card";

type Booking = {
  status: string;
  denr_status?: string | null;
  trail?: {
    name?: string;
  } | null;
};

type ReservationResponse = {
  reservations?: Booking[];
  message?: string;
};

type PackageBookingResponse = {
  bookings?: Booking[];
  message?: string;
};

type TrailData = {
  trail: string;
  bookings: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

function normalizeStatus(value?: string | null) {
  return (value || "").trim().toUpperCase();
}

function isConfirmedDirect(booking: Booking) {
  const status = normalizeStatus(booking.status);

  return status === "APPROVED" || status === "COMPLETED";
}

function isConfirmedPackage(booking: Booking) {
  const organizerStatus = normalizeStatus(booking.status);
  const denrStatus = normalizeStatus(booking.denr_status);

  return (
    (organizerStatus === "APPROVED" ||
      organizerStatus === "COMPLETED") &&
    denrStatus === "APPROVED"
  );
}

export default function TrailPopularityChart() {
  const { accessToken } = useDashboard();

  const [data, setData] = useState<TrailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrailPopularity = useCallback(
    async (signal?: AbortSignal) => {
      if (!accessToken) {
        setData([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const headers = {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        };

        const [reservationResponse, packageResponse] = await Promise.all([
          fetch(`${API_URL}/api/admin/reservations`, {
            headers,
            cache: "no-store",
            signal,
          }),

          fetch(`${API_URL}/api/admin/package-bookings`, {
            headers,
            cache: "no-store",
            signal,
          }),
        ]);

        const [reservationResult, packageResult] = await Promise.all([
          reservationResponse.json() as Promise<ReservationResponse>,
          packageResponse.json() as Promise<PackageBookingResponse>,
        ]);

        if (!reservationResponse.ok) {
          throw new Error(
            reservationResult.message ||
              "Failed to retrieve direct reservations."
          );
        }

        if (!packageResponse.ok) {
          throw new Error(
            packageResult.message ||
              "Failed to retrieve package bookings."
          );
        }

        const reservations = Array.isArray(
          reservationResult.reservations
        )
          ? reservationResult.reservations
          : [];

        const packageBookings = Array.isArray(packageResult.bookings)
          ? packageResult.bookings
          : [];

        const confirmedBookings = [
          ...reservations.filter(isConfirmedDirect),
          ...packageBookings.filter(isConfirmedPackage),
        ];

        const trailCounts = new Map<string, number>();

        confirmedBookings.forEach((booking) => {
          const trailName = booking.trail?.name?.trim();

          if (!trailName) return;

          trailCounts.set(
            trailName,
            (trailCounts.get(trailName) || 0) + 1
          );
        });

        const chartData = Array.from(
          trailCounts,
          ([trail, bookings]) => ({
            trail,
            bookings,
          })
        ).sort((a, b) => b.bookings - a.bookings);

        if (!signal?.aborted) {
          setData(chartData);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error(err);

        setData([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load trail booking data."
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [accessToken]
  );

  useEffect(() => {
    const controller = new AbortController();

    void fetchTrailPopularity(controller.signal);

    return () => controller.abort();
  }, [fetchTrailPopularity]);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Confirmed Bookings by Trail
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Approved direct reservations and package bookings with final DENR approval.
        </p>
      </div>

      {loading ? (
        <div className="flex h-80 items-center justify-center text-sm text-zinc-500">
          Loading confirmed trail bookings...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="flex h-80 items-center justify-center text-center text-sm text-red-500"
        >
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-80 flex-col items-center justify-center text-center">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            No confirmed trail bookings available
          </p>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Trail statistics will appear when bookings receive final approval.
          </p>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#3f3f46"
                opacity={0.15}
              />

              <XAxis
                type="number"
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                type="category"
                dataKey="trail"
                tickLine={false}
                axisLine={false}
                width={110}
              />

              <Tooltip />

              <Bar
                dataKey="bookings"
                name="Confirmed Bookings"
                radius={[0, 10, 10, 0]}
                fill="#10b981"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
