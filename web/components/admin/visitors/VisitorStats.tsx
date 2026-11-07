"use client";

import { useEffect, useState } from "react";

import {
  CalendarDays,
  ClipboardList,
  UserRound,
  Users,
} from "lucide-react";

import { useDashboard } from "@/components/admin/DashboardClient";
import StatCard from "@/components/ui/StatCard";

type Visitor = {
  source: "DIRECT" | "PACKAGE";
  booking_status: string;
  denr_status?: string | null;
};

type ApiResponse = {
  visitors?: Visitor[];
  message?: string;
};

type VisitorStatsData = {
  total: number;
  direct: number;
  packages: number;
  approved: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

function normalizeStatus(value?: string | null) {
  return (value || "").trim().toUpperCase();
}

export default function VisitorStats() {
  const { accessToken } = useDashboard();

  const [stats, setStats] = useState<VisitorStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStats() {
      if (!accessToken) {
        setStats(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/admin/visitors`,
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
            result.message || "Failed to load visitor statistics."
          );
        }

        const visitors = Array.isArray(result.visitors)
          ? result.visitors
          : [];

        const approved = visitors.filter((visitor) => {
          const bookingStatus = normalizeStatus(visitor.booking_status);

          if (visitor.source === "DIRECT") {
            return bookingStatus === "APPROVED";
          }

          if (visitor.source === "PACKAGE") {
            return (
              bookingStatus === "APPROVED" &&
              normalizeStatus(visitor.denr_status) === "APPROVED"
            );
          }

          return false;
        }).length;

        setStats({
          total: visitors.length,
          direct: visitors.filter(
            (visitor) => visitor.source === "DIRECT"
          ).length,
          packages: visitors.filter(
            (visitor) => visitor.source === "PACKAGE"
          ).length,
          approved,
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setStats(null);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load visitor statistics."
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

  const items = [
    {
      title: "Total Visitors",
      value: stats?.total,
      subtitle: "All visitor records from bookings",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-500/10",
    },
    {
      title: "Direct Visitors",
      value: stats?.direct,
      subtitle: "Direct reservation participants",
      icon: UserRound,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-500/10",
    },
    {
      title: "Package Visitors",
      value: stats?.packages,
      subtitle: "Tourists registered through packages",
      icon: ClipboardList,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Approved Visitors",
      value: stats?.approved,
      subtitle: "Visitors with final DENR approval",
      icon: CalendarDays,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-500/10",
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

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <StatCard
              key={item.title}
              title={item.title}
              value={
                loading || error || item.value === undefined
                  ? "—"
                  : item.value.toLocaleString()
              }
              subtitle={item.subtitle}
              iconColor={item.color}
              iconBg={item.bg}
            >
              <Icon className="h-7 w-7" />
            </StatCard>
          );
        })}
      </div>
    </section>
  );
}
