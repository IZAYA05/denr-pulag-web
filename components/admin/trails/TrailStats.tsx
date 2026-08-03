import {
  Mountain,
  MountainSnow,
  MountainIcon,
  Wrench,
} from "lucide-react";

const stats = [
  {
    title: "Total Trails",
    value: "3",
    icon: Mountain,
    color:
      "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    title: "Open Trails",
    value: "2",
    icon: MountainSnow,
    color:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    title: "Closed Trails",
    value: "0",
    icon: MountainIcon,
    color:
      "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  },
  {
    title: "Maintenance",
    value: "1",
    icon: Wrench,
    color:
      "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
];

export default function TrailStats() {
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