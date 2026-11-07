"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  Mountain,
  Users,
} from "lucide-react";

import StatCard from "@/components/ui/StatCard";
import { useDashboard } from "@/components/admin/DashboardClient";

type ApiRecord = Record<string, unknown>;

type DashboardStatsData = {
  reservations: number;
  visitors: number;
  activeTrails: number;
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

function isActiveTrail(value: unknown) {
  return value === true || value === 1 || value === "1";
}

export default function DashboardStats() {
  const { accessToken } = useDashboard();

  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStats() {
      if (!accessToken) {
        setStats(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_LARAVEL_API_URL ||
          "http://localhost:18000";

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
            fetch(`${apiBaseUrl}${endpoint}`, {
              headers,
              cache: "no-store",
              signal: controller.signal,
            })
          )
        );

        const failedResponse = responses.find(
          (response) => !response.ok
        );

        if (failedResponse) {
          throw new Error(
            `Unable to retrieve dashboard statistics (${failedResponse.status}).`
          );
        }

        const [
          reservationsPayload,
          packageBookingsPayload,
          visitorsPayload,
          trailsPayload,
        ] = await Promise.all(
          responses.map(
            (response) => response.json() as Promise<unknown>
          )
        );

        const reservations = extractRecords(
          reservationsPayload,
          ["reservations"]
        );

        const packageBookings = extractRecords(
          packageBookingsPayload,
          ["bookings", "package_bookings"]
        );

        const visitors = extractRecords(
          visitorsPayload,
          ["visitors"]
        );

        const trails = extractRecords(
          trailsPayload,
          ["trails"]
        );

        const activeTrails = trails.filter((trail) =>
          isActiveTrail(trail.is_active)
        ).length;

        setStats({
          reservations:
            reservations.length + packageBookings.length,
          visitors: visitors.length,
          activeTrails,
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setStats(null);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard statistics."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchStats();

    return () => controller.abort();
  }, [accessToken]);

  const formatValue = (value?: number) => {
    if (loading || !stats || error) return "—";
    return (value ?? 0).toLocaleString();
  };

  return (
    <section className="space-y-3">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Booking Records"
          value={formatValue(stats?.reservations)}
          subtitle="All direct and package booking records"
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600"
        >
          <ClipboardList className="h-7 w-7" />
        </StatCard>

        <StatCard
          title="Booked Visitor Records"
          value={formatValue(stats?.visitors)}
          subtitle="Visitor entries from recorded bookings"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600"
        >
          <Users className="h-7 w-7" />
        </StatCard>

        <StatCard
          title="Active Trails"
          value={formatValue(stats?.activeTrails)}
          subtitle="Trails marked active in the database"
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600"
        >
          <Mountain className="h-7 w-7" />
        </StatCard>
      </div>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
