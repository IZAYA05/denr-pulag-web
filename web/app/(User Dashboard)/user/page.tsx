import {
  ArrowRight,
  Bell,
} from "lucide-react";

const announcements = [
  {
    title: "Welcome to E-PULAG",
    description:
      "You can now manage your Mount Pulag reservations from your dashboard.",
    date: "Today",
  },
  {
    title: "Reservation Guidelines",
    description:
      "Please review the requirements before submitting a reservation.",
    date: "Recently",
  },
];

export default function Announcements() {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">
            UPDATES
          </p>

          <h2 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            Recent Announcements
          </h2>
        </div>

        <Bell className="h-6 w-6 text-emerald-600" />
      </div>

      <div className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
        {announcements.map((announcement) => (
          <div
            key={announcement.title}
            className="flex items-center justify-between gap-6 py-5 first:pt-0 last:pb-0"
          >
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                {announcement.title}
              </h3>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {announcement.description}
              </p>
            </div>

            <span className="whitespace-nowrap text-xs text-zinc-400">
              {announcement.date}
            </span>
          </div>
        ))}
      </div>

      <button className="mt-6 flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:gap-3">
        View All Announcements
        <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  );
}