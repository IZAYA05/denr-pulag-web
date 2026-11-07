"use client";

import { useEffect, useState } from "react";

import {
  Mountain,
  MountainSnow,
  MountainIcon,
} from "lucide-react";

import { useDashboard } from "@/components/admin/DashboardClient";
import StatCard from "@/components/ui/StatCard";

type Trail = {
  id: number;
  is_active: boolean | number | string;
};

type ApiResponse = {
  trails?: Trail[];
  message?: string;
};

type TrailStatsData = {
  total: number;
  active: number;
  inactive: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

function isActiveTrail(value: Trail["is_active"]) {
  return value === true || value === 1 || value === "1";
}

export default function TrailStats() {
  const { accessToken } = useDashboard();

  const [trails, setTrails] = useState<TrailStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTrails() {
      if (!accessToken) {
        setTrails(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/admin/trails`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
          signal: controller.signal,
        });

        const result: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load trail statistics."
          );
        }

        const records = Array.isArray(result.trails)
          ? result.trails
          : [];

        const active = records.filter((trail) =>
          isActiveTrail(trail.is_active)
        ).length;

        setTrails({
          total: records.length,
          active,
          inactive: records.length - active,
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setTrails(null);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load trail statistics."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchTrails();

    return () => controller.abort();
  }, [accessToken]);

  const stats = [
    {
      title: "Total Trails",
      value: trails?.total,
      subtitle: "All registered trails",
      icon: Mountain,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-500/10",
    },
    {
      title: "Active Trails",
      value: trails?.active,
      subtitle: "Marked active in the database",
      icon: MountainSnow,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-500/10",
    },
    {
      title: "Inactive Trails",
      value: trails?.inactive,
      subtitle: "Marked inactive in the database",
      icon: MountainIcon,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-500/10",
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
              iconColor={stat.color}
              iconBg={stat.bg}
            >
              <Icon className="h-7 w-7" />
            </StatCard>
          );
        })}
      </div>
    </section>
  );
}
