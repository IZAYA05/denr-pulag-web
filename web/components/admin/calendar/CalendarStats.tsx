"use client";

import { useEffect, useState } from "react";

import {
  CalendarDays,
  Users,
  Mountain,
} from "lucide-react";

import Card from "@/components/ui/Card";
import { useDashboard } from "@/components/admin/DashboardClient";

type DirectBooking = {
  hiking_date?: string | null;
  status: string;
  total_participants?: number | null;
  participants?: unknown[];
};

type PackageBooking = {
  hiking_date?: string | null;
  status: string;
  denr_status?: string | null;
  tourist_count?: number | null;
  tourists?: unknown[];
};

type ApiResponse<T> = {
  reservations?: T[];
  bookings?: T[];
  message?: string;
};

type Statistics = {
  upcomingBookings: number;
  todayVisitors: number;
  datesAtCapacity: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

const DAILY_CAPACITY = 500;

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeStatus(value?: string | null) {
  return (value || "").trim().toUpperCase();
}

function getParticipantCount(
  value?: number | null,
  fallbackArray?: unknown[]
): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (Array.isArray(fallbackArray)) {
    return fallbackArray.length;
  }

  return null;
}

function isValidDate(value?: string | null): value is string {
  if (!value) return false;

  const date = value.slice(0, 10);

  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export default function CalendarStats() {
  const { accessToken } = useDashboard();

  const [statistics, setStatistics] = useState<Statistics>({
    upcomingBookings: 0,
    todayVisitors: 0,
    datesAtCapacity: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStatistics() {
      if (!accessToken) {
        setStatistics({
          upcomingBookings: 0,
          todayVisitors: 0,
          datesAtCapacity: 0,
        });
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

        const [directResponse, packageResponse] = await Promise.all([
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

        const [directData, packageData] = await Promise.all([
          directResponse.json() as Promise<ApiResponse<DirectBooking>>,
          packageResponse.json() as Promise<ApiResponse<PackageBooking>>,
        ]);

        if (!directResponse.ok) {
          throw new Error(
            directData.message || "Failed to load reservations."
          );
        }

        if (!packageResponse.ok) {
          throw new Error(
            packageData.message || "Failed to load package bookings."
          );
        }

        const directBookings = Array.isArray(directData.reservations)
          ? directData.reservations
          : [];

        const packageBookings = Array.isArray(packageData.bookings)
          ? packageData.bookings
          : [];

        const today = localDateString(new Date());

        // Exclude cancelled and rejected bookings from occupancy calculations.
        const eligibleDirect = directBookings.filter((booking) => {
          const status = normalizeStatus(booking.status);

          return status !== "CANCELLED" && status !== "REJECTED";
        });

        const eligiblePackages = packageBookings.filter((booking) => {
          const status = normalizeStatus(booking.status);
          const denrStatus = normalizeStatus(booking.denr_status);

          return (
            status !== "CANCELLED" &&
            status !== "REJECTED" &&
            denrStatus !== "REJECTED"
          );
        });

        // Count future booking records, not unique calendar dates.
        const upcomingBookings = [
          ...eligibleDirect.map((booking) => booking.hiking_date),
          ...eligiblePackages.map((booking) => booking.hiking_date),
        ].filter(
          (date) => isValidDate(date) && date.slice(0, 10) >= today
        ).length;

        // Direct reservations require DENR approval.
        const directVisitorsToday = eligibleDirect
          .filter(
            (booking) =>
              isValidDate(booking.hiking_date) &&
              booking.hiking_date.slice(0, 10) === today &&
              normalizeStatus(booking.status) === "APPROVED"
          )
          .reduce((total, booking) => {
            const count = getParticipantCount(
              booking.total_participants,
              booking.participants
            );

            return total + (count ?? 0);
          }, 0);

        // Package bookings require both Organizer and DENR approval.
        const packageVisitorsToday = eligiblePackages
          .filter(
            (booking) =>
              isValidDate(booking.hiking_date) &&
              booking.hiking_date.slice(0, 10) === today &&
              normalizeStatus(booking.status) === "APPROVED" &&
              normalizeStatus(booking.denr_status) === "APPROVED"
          )
          .reduce((total, booking) => {
            const count = getParticipantCount(
              booking.tourist_count,
              booking.tourists
            );

            return total + (count ?? 0);
          }, 0);

        // Capacity includes non-cancelled and non-rejected bookings,
        // including requests that are still awaiting review.
        const dailyOccupancy = new Map<string, number>();

        eligibleDirect.forEach((booking) => {
          if (!isValidDate(booking.hiking_date)) return;

          const date = booking.hiking_date.slice(0, 10);

          if (date < today) return;

          const participants = getParticipantCount(
            booking.total_participants,
            booking.participants
          );

          if (participants === null) return;

          dailyOccupancy.set(
            date,
            (dailyOccupancy.get(date) || 0) + participants
          );
        });

        eligiblePackages.forEach((booking) => {
          if (!isValidDate(booking.hiking_date)) return;

          const date = booking.hiking_date.slice(0, 10);

          if (date < today) return;

          const tourists = getParticipantCount(
            booking.tourist_count,
            booking.tourists
          );

          if (tourists === null) return;

          dailyOccupancy.set(
            date,
            (dailyOccupancy.get(date) || 0) + tourists
          );
        });

        const datesAtCapacity = Array.from(dailyOccupancy.values()).filter(
          (visitors) => visitors >= DAILY_CAPACITY
        ).length;

        setStatistics({
          upcomingBookings,
          todayVisitors: directVisitorsToday + packageVisitorsToday,
          datesAtCapacity,
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load calendar statistics."
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
      title: "Upcoming Bookings",
      value: statistics.upcomingBookings,
      subtitle: "Future direct and package bookings",
      icon: CalendarDays,
      iconClass:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
    {
      title: "Today's Confirmed Visitors",
      value: statistics.todayVisitors,
      subtitle: "Visitors with final DENR approval",
      icon: Users,
      iconClass:
        "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    },
    {
      title: "Dates at Capacity",
      value: statistics.datesAtCapacity,
      subtitle: `Dates with at least ${DAILY_CAPACITY} reserved visitors, including pending requests`,
      icon: Mountain,
      iconClass:
        "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
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
            <Card
              key={stat.title}
              className="p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.iconClass}`}
              >
                <Icon className="h-7 w-7" />
              </div>

              <h3 className="mt-5 text-3xl font-bold text-zinc-900 dark:text-white">
                {loading || error ? "—" : stat.value.toLocaleString()}
              </h3>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {stat.title}
              </p>

              <p className="mt-1 text-xs text-zinc-400">
                {stat.subtitle}
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
