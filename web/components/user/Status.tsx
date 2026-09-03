import {
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

const statuses = [
  {
    label: "Pending",
    value: 0,
    icon: Clock,
    color: "text-amber-500",
  },
  {
    label: "Approved",
    value: 0,
    icon: CheckCircle2,
    color: "text-emerald-500",
  },
  {
    label: "Cancelled",
    value: 0,
    icon: XCircle,
    color: "text-red-500",
  },
];

export default function Status() {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <p className="text-sm font-medium text-emerald-600">
          RESERVATIONS
        </p>

        <h2 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
          Reservation Status
        </h2>
      </div>

      <div className="mt-8 space-y-5">
        {statuses.map((status) => {
          const Icon = status.icon;

          return (
            <div
              key={status.label}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-5 w-5 ${status.color}`}
                />

                <span className="text-zinc-600 dark:text-zinc-400">
                  {status.label}
                </span>
              </div>

              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                {status.value}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}