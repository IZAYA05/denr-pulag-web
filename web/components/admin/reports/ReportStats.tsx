"use client";

import { useEffect, useState } from "react";

import {
  CalendarCheck,
  Mountain,
  Users,
} from "lucide-react";

import StatCard from "@/components/ui/StatCard";
import { useDashboard } from "@/components/admin/DashboardClient";

type TrailRecord = {
  id: number;
  is_active: boolean | number | string;
};

type ApiResponse = {
  reservations?: unknown[];
  bookings?: unknown[];
  visitors?: unknown[];
  trails?: TrailRecord[];
  message?: string;
};

type Statistics = {
  totalBookings: number;
  totalVisitors: number;
  activeTrails: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

function isActiveTrail(value: TrailRecord["is_active"]) {
  return value === true || value === 1 || value === "1";
}

export default function ReportStats() {
  const { accessToken } = useDashboard();

  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStatistics() {
      if (!accessToken) {
        setStatistics(null);
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

        const endpoints = [
          "/api/admin/reservations",
          "/api/admin/package-bookings",
          "/api/admin/visitors",
          "/api/admin/trails",
        ];

        const responses = await Promise.all(
          endpoints.map((endpoint) =>
            fetch(`${API_URL}${endpoint}`, {
              headers,
              cache: "no-store",
              signal: controller.signal,
            })
          )
        );

        const results: ApiResponse[] = await Promise.all(
          responses.map((response) => response.json())
        );

        for (let index = 0; index < responses.length; index++) {
          if (!responses[index].ok) {
            throw new Error(
              results[index].message ||
                `Failed to load report data (${responses[index].status}).`
            );
          }
        }

        const reservations = Array.isArray(results[0].reservations)
          ? results[0].reservations
          : [];

        const bookings = Array.isArray(results[1].bookings)
          ? results[1].bookings
          : [];

        const visitors = Array.isArray(results[2].visitors)
          ? results[2].visitors
          : [];

        const trails = Array.isArray(results[3].trails)
          ? results[3].trails
          : [];

        if (!controller.signal.aborted) {
          setStatistics({
            totalBookings: reservations.length + bookings.length,
            totalVisitors: visitors.length,
            activeTrails: trails.filter((trail) =>
              isActiveTrail(trail.is_active)
            ).length,
          });
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setStatistics(null);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load report statistics."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchStatistics();

    return () => controller.abort();
  }, [accessToken]);

  const stats = [
    {
      title: "Total Bookings",
      value: statistics?.totalBookings,
      subtitle: "All direct and package booking records",
      icon: CalendarCheck,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-500/10",
    },
    {
      title: "Total Visitors",
      value: statistics?.totalVisitors,
      subtitle: "Visitor records across all booking statuses",
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-500/10",
    },
    {
      title: "Active Trails",
      value: statistics?.activeTrails,
      subtitle: "Trails marked active in the database",
      icon: Mountain,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-500/10",
    },
  ];

  return (
    <section className="space-y-3">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={
                loading || error || stat.value === undefined
                  ? "—"
                  : stat.value.toLocaleString()
              }
              subtitle={stat.subtitle}
              iconColor={stat.iconColor}
              iconBg={stat.iconBg}
            >
              <Icon className="h-7 w-7" />
            </StatCard>
          );
        })}
      </div>
    </section>
  );
}
