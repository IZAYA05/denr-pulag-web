import Card from "@/components/ui/Card";

import {
  CalendarDays,
  Users,
  Mountain,
  Wrench,
} from "lucide-react";

const stats = [
  {
    title: "Upcoming Hikes",
    value: "24",
    icon: CalendarDays,
    iconClass:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    title: "Today's Visitors",
    value: "128",
    icon: Users,
    iconClass:
      "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    title: "Fully Booked Dates",
    value: "6",
    icon: Mountain,
    iconClass:
      "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  {
    title: "Trail Maintenance",
    value: "1",
    icon: Wrench,
    iconClass:
      "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  },
];

export default function CalendarStats() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
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
              {stat.value}
            </h3>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {stat.title}
            </p>
          </Card>
        );
      })}
    </div>
  );
}