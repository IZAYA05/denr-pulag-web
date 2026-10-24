import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Users,
} from "lucide-react";

export default function UserUpcomingReservation() {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Reservation
          </p>
          <h2 className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
            Upcoming Reservation
          </h2>
        </div>

        <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
          <MapPin className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 space-y-4 text-sm text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-emerald-600" />
          <span>No upcoming reservation</span>
        </div>

        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-emerald-600" />
          <span>No participants yet</span>
        </div>
      </div>

      <Link
        href="/user/reservations"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:gap-3"
      >
        View Reservations
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
