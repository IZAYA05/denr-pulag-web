import {
  CalendarDays,
  Clock3,
  UserCheck,
  Users,
} from "lucide-react";

import StatCard from "@/components/ui/StatCard";

const stats = [
  {
    title: "Total Visitors",
    value: "2,486",
    subtitle: "All registered visitors",
    icon: Users,
    color:
      "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    title: "Checked In",
    value: "1,920",
    subtitle: "Visitors already checked in",
    icon: UserCheck,
    color:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    title: "Pending Check-in",
    value: "520",
    subtitle: "Awaiting check-in",
    icon: Clock3,
    color:
      "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  {
    title: "Today's Visitors",
    value: "46",
    subtitle: "Visitors scheduled today",
    icon: CalendarDays,
    color:
      "bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  },
];

export default function VisitorStats() {
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
            iconColor={stat.color.split(" ").filter((className) =>
              className.startsWith("text-")
            ).join(" ")}
            iconBg={stat.color.split(" ").filter((className) =>
              className.startsWith("bg-")
            ).join(" ")}
          >
            <Icon className="h-7 w-7" />
          </StatCard>
        );
      })}
    </section>
  );
}