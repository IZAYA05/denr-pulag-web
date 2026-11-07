"use client";

import { useEffect, useState } from "react";

import {
  CalendarCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  CircleCheckBig,
} from "lucide-react";

import { useDashboard } from "@/components/admin/DashboardClient";
import StatCard from "@/components/ui/StatCard";

type Reservation = {
  status: string;
};

type ApiResponse = {
  reservations?: Reservation[];
  message?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

export default function ReservationStats() {
  const { accessToken } = useDashboard();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchReservations() {
      if (!accessToken) {
        setReservations([]);
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
            result.message || "Failed to load reservation statistics."
          );
        }

        setReservations(
          Array.isArray(result.reservations)
            ? result.reservations
            : []
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load reservation statistics."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchReservations();

    return () => controller.abort();
  }, [accessToken]);

  const count = (status: string) =>
    reservations.filter(
      (reservation) =>
        reservation.status?.trim().toUpperCase() === status
    ).length;

  const stats = [
    {
      title: "Total Reservations",
      value: reservations.length,
      subtitle: "All direct reservation records",
      icon: CalendarCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Pending",
      value: count("PENDING"),
      subtitle: "Awaiting DENR review",
      icon: Clock3,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Approved",
      value: count("APPROVED"),
      subtitle: "Approved by DENR",
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Rejected / Cancelled",
      value: count("REJECTED") + count("CANCELLED"),
      subtitle: "Rejected or cancelled requests",
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      title: "Completed",
      value: count("COMPLETED"),
      subtitle: "Completed reservations",
      icon: CircleCheckBig,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
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

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={loading || error ? "—" : stat.value.toLocaleString()}
              subtitle={stat.subtitle}
              iconColor={stat.color}
              iconBg={stat.bg}
            >
              <Icon className="h-6 w-6" />
            </StatCard>
          );
        })}
      </div>
    </section>
  );
}
