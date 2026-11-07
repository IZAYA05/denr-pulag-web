"use client";

import { useEffect, useState } from "react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Card from "@/components/ui/Card";
import { useDashboard } from "@/components/admin/DashboardClient";

type BookingRecord = {
  created_at?: string | null;
  booking_date?: string | null;
};

type ReservationResponse = {
  reservations?: BookingRecord[];
  message?: string;
};

type PackageBookingResponse = {
  bookings?: BookingRecord[];
  message?: string;
};

type MonthlyData = {
  month: string;
  bookings: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function BookingChart() {
  const { accessToken } = useDashboard();

  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const year = new Date().getFullYear();

  useEffect(() => {
    const controller = new AbortController();

    async function fetchBookings() {
      if (!accessToken) {
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

        const [reservationResult, packageResult] = await Promise.all([
          reservationResponse.json() as Promise<ReservationResponse>,
          packageResponse.json() as Promise<PackageBookingResponse>,
        ]);

        if (!reservationResponse.ok) {
          throw new Error(
            reservationResult.message ||
              "Failed to load direct reservation data."
          );
        }

        if (!packageResponse.ok) {
          throw new Error(
            packageResult.message ||
              "Failed to load package booking data."
          );
        }

        const reservations = Array.isArray(
          reservationResult.reservations
        )
          ? reservationResult.reservations
          : [];

        const packageBookings = Array.isArray(
          packageResult.bookings
        )
          ? packageResult.bookings
          : [];

        const allBookings = [
          ...reservations,
          ...packageBookings,
        ];

        const counts = Array(12).fill(0);

        allBookings.forEach((booking) => {
          const dateValue =
            booking.created_at || booking.booking_date;

          if (!dateValue) return;

          const date = new Date(dateValue);

          if (
            Number.isNaN(date.getTime()) ||
            date.getFullYear() !== year
          ) {
            return;
          }

          counts[date.getMonth()]++;
        });

        setData(
          MONTHS.map((month, index) => ({
            month,
            bookings: counts[index],
          }))
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load booking statistics."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchBookings();

    return () => controller.abort();
  }, [accessToken, year]);

  const hasData = data.some((item) => item.bookings > 0);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Monthly Bookings
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Direct and package bookings for {year}
        </p>
      </div>

      {loading ? (
        <div className="flex h-80 items-center justify-center text-sm text-zinc-500">
          Loading booking statistics...
        </div>
      ) : error ? (
        <div className="flex h-80 items-center justify-center text-center text-sm text-red-500">
          {error}
        </div>
      ) : !hasData ? (
        <div className="flex h-80 flex-col items-center justify-center text-center">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            No booking data available
          </p>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Monthly booking trends will appear when actual records are available.
          </p>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="bookingGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#10b981"
                    stopOpacity={0.4}
                  />

                  <stop
                    offset="95%"
                    stopColor="#10b981"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#3f3f46"
                opacity={0.15}
              />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="bookings"
                name="Bookings"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#bookingGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
