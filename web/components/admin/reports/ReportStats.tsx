import {
  CalendarCheck,
  Footprints,
  Mountain,
  Users,
} from "lucide-react";

import StatCard from "@/components/ui/StatCard";

const stats = [
  {
    title: "Total Bookings",
    value: "1,254",
    subtitle: "All reservations",
    icon: CalendarCheck,
    iconColor:
      "text-emerald-600 dark:text-emerald-400",
    iconBg:
      "bg-emerald-100 dark:bg-emerald-500/10",
  },
  {
    title: "Total Visitors",
    value: "8,972",
    subtitle: "Registered visitors",
    icon: Users,
    iconColor:
      "text-blue-600 dark:text-blue-400",
    iconBg:
      "bg-blue-100 dark:bg-blue-500/10",
  },
  {
    title: "Completed Hikes",
    value: "7,843",
    subtitle: "Successfully completed",
    icon: Footprints,
    iconColor:
      "text-purple-600 dark:text-purple-400",
    iconBg:
      "bg-purple-100 dark:bg-purple-500/10",
  },
  {
    title: "Open Trails",
    value: "3",
    subtitle: "Currently available",
    icon: Mountain,
    iconColor:
      "text-amber-600 dark:text-amber-400",
    iconBg:
      "bg-amber-100 dark:bg-amber-500/10",
  },
];

export default function ReportStats() {
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            iconColor={stat.iconColor}
            iconBg={stat.iconBg}
          >
            <Icon className="h-7 w-7" />
          </StatCard>
        );
      })}
    </section>
  );
}