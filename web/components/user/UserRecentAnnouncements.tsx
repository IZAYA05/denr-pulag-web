import Link from "next/link";
import {
  ArrowRight,
  Bell,
} from "lucide-react";

const announcements = [
  {
    title: "Welcome to E-PULAG",
    description:
      "Manage your Mount Pulag reservations through your dashboard.",
    date: "Latest update",
  },
  {
    title: "Reservation Guidelines",
    description:
      "Review the requirements before submitting a reservation.",
    date: "Visitor information",
  },
];

export default function UserRecentAnnouncements() {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Updates
          </p>
          <h2 className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
            Recent Announcements
          </h2>
        </div>

        <Bell className="h-5 w-5 text-emerald-600" />
      </div>

      <div className="mt-5 divide-y divide-zinc-200 dark:divide-zinc-800">
        {announcements.map((announcement) => (
          <article key={announcement.title} className="py-4 first:pt-0 last:pb-0">
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              {announcement.title}
            </h3>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {announcement.description}
            </p>

            <p className="mt-2 text-xs text-zinc-400">
              {announcement.date}
            </p>
          </article>
        ))}
      </div>

      <Link
        href="/user/announcements"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:gap-3"
      >
        View All Announcements
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
