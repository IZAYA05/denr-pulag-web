"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import { useDashboard } from "@/components/admin/DashboardClient";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Reservation = {
  booking_date?: string | null;
  created_at?: string | null;
};

type ApiResponse = {
  reservations?: Reservation[];
  message?: string;
};

type MonthlyData = {
  month: string;
  reservations: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function MonthlyChart() {
  const { accessToken } = useDashboard();

  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const year = new Date().getFullYear();

  useEffect(() => {
    const controller = new AbortController();

    async function fetchReservations() {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/admin/reservations`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load reservation data."
          );
        }

        const reservations = Array.isArray(result.reservations)
          ? result.reservations
          : [];

        const counts = Array(12).fill(0);

        reservations.forEach((reservation) => {
          const dateValue =
            reservation.booking_date || reservation.created_at;

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
            reservations: counts[index],
          }))
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load reservation data."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchReservations();

    return () => controller.abort();
  }, [accessToken, year]);

  const hasData = data.some((item) => item.reservations > 0);

  return (
    <Card className="bg-white/90 p-6 backdrop-blur-xl dark:bg-zinc-950/90">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Monthly Reservations
        </h2>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Direct reservation trends for {year}
        </p>
      </div>

      {loading ? (
        <div className="flex h-[340px] items-center justify-center text-sm text-zinc-500">
          Loading reservation statistics...
        </div>
      ) : error ? (
        <div className="flex h-[340px] items-center justify-center text-center text-sm text-red-500">
          {error}
        </div>
      ) : !hasData ? (
        <div className="flex h-[340px] flex-col items-center justify-center text-center">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            No reservation data available
          </p>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Monthly statistics will appear when reservation records are available.
          </p>
        </div>
      ) : (
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 13 }}
              />

              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 13 }}
              />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="reservations"
                name="Reservations"
                stroke="#059669"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#059669",
                  strokeWidth: 2,
                  stroke: "#ffffff",
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
