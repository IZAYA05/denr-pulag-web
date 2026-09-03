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
    title: "Upcoming Hike",
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

export default function Stats() {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  {stat.title}
                </p>

                <h2 className="mt-3 text-4xl font-bold text-zinc-900 dark:text-white">
                  {stat.value}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <Icon className="h-6 w-6" />
              </div>
            </div>

            <p className="mt-4 text-sm text-zinc-500">
              {stat.description}
            </p>
          </div>
        );
      })}
    </section>
  );
}