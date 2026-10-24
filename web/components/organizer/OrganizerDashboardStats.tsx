"use client";

import {
  CalendarDays,
  ClipboardList,
  Package,
} from "lucide-react";

import StatCard from "@/components/ui/StatCard";

export default function OrganizerDashboardStats() {
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Active Packages"
        value={0}
        subtitle="Packages currently available"
        iconBg="bg-amber-100 dark:bg-amber-900/30"
        iconColor="text-amber-600"
      >
        <Package className="h-7 w-7" />
      </StatCard>

      <StatCard
        title="Package Bookings"
        value={0}
        subtitle="Total package bookings"
        iconBg="bg-blue-100 dark:bg-blue-900/30"
        iconColor="text-blue-600"
      >
        <ClipboardList className="h-7 w-7" />
      </StatCard>

      <StatCard
        title="Upcoming Trips"
        value={0}
        subtitle="Bookings with upcoming trips"
        iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        iconColor="text-emerald-600"
      >
        <CalendarDays className="h-7 w-7" />
      </StatCard>

      <StatCard
        title="Pending Coordination"
        value={0}
        subtitle="Bookings awaiting coordination"
        iconBg="bg-purple-100 dark:bg-purple-900/30"
        iconColor="text-purple-600"
      >
        <ClipboardList className="h-7 w-7" />
      </StatCard>
    </section>
  );
}