import {
  Users,
  UserCheck,
  Clock3,
  CalendarDays,
} from "lucide-react";

const stats = [
  {
    title: "Total Visitors",
    value: "2,486",
    icon: Users,
    color:
      "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    title: "Checked In",
    value: "1,920",
    icon: UserCheck,
    color:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    title: "Pending Check-in",
    value: "520",
    icon: Clock3,
    color:
      "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  {
    title: "Today's Visitors",
    value: "46",
    icon: CalendarDays,
    color:
      "bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  },
];

export default function VisitorStats() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {stat.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                  {stat.value}
                </h2>
              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.color}`}
              >
                <Icon className="h-7 w-7" />
              </div>
            </div>
          </div>
        );
      })} 
    </div>
  );
}