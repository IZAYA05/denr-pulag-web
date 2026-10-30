"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  Users,
  MapPinned,
  CalendarClock,
} from "lucide-react";
import { useEmployeeDashboard } from "@/components/employee/EmployeeDashboardClient";

type DashboardData = {
  date: string;
  pending_direct_reservations: number;
  pending_package_bookings: number;
  pending_bookings: number;
  confirmed_visitors_today: number;
  trails: {
    active: number;
    inactive: number;
  };
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

export default function EmployeeStats() {
  const { accessToken } = useEmployeeDashboard();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStats() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/employee/dashboard`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load statistics (${response.status}).`);
        }

        const result: DashboardData = await response.json();
        setData(result);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard statistics."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchStats();

    return () => controller.abort();
  }, [accessToken]);

  const stats = [
    {
      label: "Pending Bookings",
      value: data?.pending_bookings,
      icon: ClipboardList,
      description: "All booking types",
    },
    {
      label: "Confirmed Visitors Today",
      value: data?.confirmed_visitors_today,
      icon: Users,
      description: "Approved bookings",
    },
    {
      label: "Active Trails",
      value: data?.trails.active,
      icon: MapPinned,
      description: "Currently active",
    },
    {
      label: "Pending Direct Reservations",
      value: data?.pending_direct_reservations,
      icon: CalendarClock,
      description: "Awaiting review",
    },
  ];

  return (
    <section className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                  <Icon size={22} />
                </div>

                <span className="text-xs text-zinc-400">
                  {loading ? "Loading" : "Live data"}
                </span>
              </div>

              <p className="mt-5 text-sm text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </p>

              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                {loading ? "—" : (stat.value ?? 0)}
              </p>

              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {stat.description}
              </p>
            </article>
          );
        })}
      </div>

      {data && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Statistics date: {data.date} · Pending package bookings:{" "}
          {data.pending_package_bookings} · Inactive trails:{" "}
          {data.trails.inactive}
        </p>
      )}
    </section>
  );
}
