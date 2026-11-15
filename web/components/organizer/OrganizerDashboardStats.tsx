"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CalendarDays, ClipboardList, Package, Clock } from "lucide-react";

import StatCard from "@/components/ui/StatCard";

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

type PackageRecord = { status: string; approval_status?: string };
type BookingRecord = { status: string; denr_status?: string | null; hiking_date: string };
type ApiResponse<T> = { packages?: T[]; bookings?: T[] };

function todayManila() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function OrganizerDashboardStats() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const [stats, setStats] = useState({ activePackages: 0, totalBookings: 0, upcomingTrips: 0, pendingBookings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const headers = { Accept: "application/json", Authorization: `Bearer ${accessToken}` };
        const [packageResponse, bookingResponse] = await Promise.all([
          fetch(`${API_URL}/api/organizer/packages`, { headers, cache: "no-store" }),
          fetch(`${API_URL}/api/package-bookings`, { headers, cache: "no-store" }),
        ]);
        const [packageData, bookingData] = await Promise.all([
          packageResponse.json() as Promise<ApiResponse<PackageRecord>>,
          bookingResponse.json() as Promise<ApiResponse<BookingRecord>>,
        ]);
        if (!packageResponse.ok || !bookingResponse.ok) throw new Error("Unable to load organizer dashboard statistics.");

        const packages = packageData.packages || [];
        const bookings = bookingData.bookings || [];
        const today = todayManila();
        const activePackages = packages.filter((item) => item.status === "ACTIVE" && (item.approval_status || "APPROVED") === "APPROVED").length;
        const upcomingTrips = bookings.filter((item) => item.hiking_date?.slice(0, 10) >= today && !["CANCELLED", "REJECTED"].includes((item.status || "").toUpperCase()) && (item.denr_status || "APPROVED") !== "REJECTED").length;
        const pendingBookings = bookings.filter((item) => (item.status || "").toUpperCase() === "PENDING" || ((item.status || "").toUpperCase() === "APPROVED" && (item.denr_status || "PENDING").toUpperCase() === "PENDING")).length;

        if (active) setStats({ activePackages, totalBookings: bookings.length, upcomingTrips, pendingBookings });
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "Unable to load dashboard statistics.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [accessToken]);

  const cards = [
    { title: "Active Packages", value: stats.activePackages, subtitle: "DENR-approved packages available to tourists", icon: Package, bg: "bg-amber-100 dark:bg-amber-900/30", color: "text-amber-600" },
    { title: "Package Bookings", value: stats.totalBookings, subtitle: "Bookings made through your packages", icon: ClipboardList, bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600" },
    { title: "Upcoming Trips", value: stats.upcomingTrips, subtitle: "Non-cancelled bookings with future hike dates", icon: CalendarDays, bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-600" },
    { title: "Awaiting Decisions", value: stats.pendingBookings, subtitle: "Bookings awaiting organizer or DENR review", icon: Clock, bg: "bg-purple-100 dark:bg-purple-900/30", color: "text-purple-600" },
  ];

  return (
    <section className="space-y-3">
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <StatCard key={card.title} title={card.title} value={loading ? "—" : card.value} subtitle={card.subtitle} iconBg={card.bg} iconColor={card.color}>
              <Icon className="h-7 w-7" />
            </StatCard>
          );
        })}
      </div>
    </section>
  );
}
