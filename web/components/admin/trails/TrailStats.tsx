import {
  Mountain,
  MountainIcon,
  MountainSnow,
  Wrench,
} from "lucide-react";

import StatCard from "@/components/ui/StatCard";

const stats = [
  {
    title: "Total Trails",
    value: "3",
    subtitle: "All managed trails",
    icon: Mountain,
    color:
      "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    title: "Open Trails",
    value: "2",
    subtitle: "Currently available",
    icon: MountainSnow,
    color:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    title: "Closed Trails",
    value: "0",
    subtitle: "Currently closed",
    icon: MountainIcon,
    color:
      "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  },
  {
    title: "Maintenance",
    value: "1",
    subtitle: "Under maintenance",
    icon: Wrench,
    color:
      "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
];

export default function TrailStats() {
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
            iconColor={stat.color
              .split(" ")
              .filter((className) => className.startsWith("text-"))
              .join(" ")}
            iconBg={stat.color
              .split(" ")
              .filter((className) => className.startsWith("bg-"))
              .join(" ")}
          >
            <Icon className="h-7 w-7" />
          </StatCard>
        );
      })}
    </section>
  );
}