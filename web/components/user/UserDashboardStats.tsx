import {
  Bell,
  CalendarDays,
  Clock,
} from "lucide-react";

const stats = [
  {
    title: "My Reservations",
    value: "0",
    description: "Total reservations",
    icon: CalendarDays,
  },
  {
    title: "Upcoming Hikes",
    value: "0",
    description: "Scheduled hikes",
    icon: Clock,
  },
  {
    title: "Notifications",
    value: "0",
    description: "New updates",
    icon: Bell,
  },
];

export default function UserDashboardStats() {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {stat.title}
                </p>
                <p className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
                  {stat.value}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
                <Icon className="h-6 w-6" />
              </div>
            </div>

            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              {stat.description}
            </p>
          </div>
        );
      })}
    </section>
  );
}
