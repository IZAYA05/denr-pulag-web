import {
  Users,
  ShieldCheck,
  ClipboardList,
  Trees,
} from "lucide-react";

const stats = [
  {
    title: "Total Users",
    value: 12,
    icon: Users,
    iconClass:
      "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    title: "Administrators",
    value: 2,
    icon: ShieldCheck,
    iconClass:
      "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  },
  {
    title: "Booking Officers",
    value: 5,
    icon: ClipboardList,
    iconClass:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    title: "Park Rangers",
    value: 5,
    icon: Trees,
    iconClass:
      "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
];

export default function UserStats() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
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
          </div>
        );
      })}
    </div>
  );
}