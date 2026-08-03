import {
  CalendarCheck,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const stats = [
  {
    title: "Total Reservations",
    value: "264",
    icon: CalendarCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Pending",
    value: "52",
    icon: Clock3,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Approved",
    value: "185",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Cancelled",
    value: "27",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
];

export default function ReservationStats() {
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
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
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg}`}
              >
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}