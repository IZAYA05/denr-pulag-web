import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Users,
} from "lucide-react";

export default function Reservation() {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">
            RESERVATION
          </p>

          <h2 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            Upcoming Reservation
          </h2>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
          <MapPin className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
          <CalendarDays className="h-5 w-5 text-emerald-600" />

          <span>No upcoming reservation</span>
        </div>

        <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
          <Users className="h-5 w-5 text-emerald-600" />

          <span>No participants yet</span>
        </div>
      </div>

      <button className="mt-8 flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:gap-3">
        View Reservation
        <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  );
}