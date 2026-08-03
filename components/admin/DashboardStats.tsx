"use client";

import {
  ClipboardList,
  Mountain,
  Users,
} from "lucide-react";

import DashboardCard from "./DashboardCard";

export default function DashboardStats() {
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardCard
        title="Total Reservations"
        value="324"
        subtitle="+12 this month"
        iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        iconColor="text-emerald-600"
      >
        <ClipboardList className="h-7 w-7" />
      </DashboardCard>

      <DashboardCard
        title="Visitors"
        value="1,245"
        subtitle="+8% this month"
        iconBg="bg-blue-100 dark:bg-blue-900/30"
        iconColor="text-blue-600"
      >
        <Users className="h-7 w-7" />
      </DashboardCard>
            <DashboardCard
        title="Active Trails"
        value="4"
        subtitle="Available for booking"
        iconBg="bg-amber-100 dark:bg-amber-900/30"
        iconColor="text-amber-600"
      >
        <Mountain className="h-7 w-7" />
      </DashboardCard>

    {/* <DashboardCard
    title="Reports"
    value="18"
    subtitle="Pending review"
    iconBg="bg-rose-100 dark:bg-rose-900/30"
    iconColor="text-rose-600"
    >
    <FileChartColumn className="h-7 w-7" />
    </DashboardCard> */}
    </section>
  );
}