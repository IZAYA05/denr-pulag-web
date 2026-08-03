import {
  CalendarDays,
  Mountain,
  Wrench,
  Flag,
} from "lucide-react";

const events = [
  {
    id: 1,
    title: "Ambangeg Trail Reservation",
    description: "24 hikers are scheduled for the Ambangeg Trail.",
    date: "August 5, 2026",
    icon: CalendarDays,
    color:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    id: 2,
    title: "Akiki Trail Reservation",
    description: "12 hikers are scheduled for the Akiki Trail.",
    date: "August 10, 2026",
    icon: Mountain,
    color:
      "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    id: 3,
    title: "Trail Maintenance",
    description: "Ambangeg Trail will undergo maintenance.",
    date: "August 15, 2026",
    icon: Wrench,
    color:
      "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  },
  {
    id: 4,
    title: "National Holiday",
    description: "Reservations are unavailable for this day.",
    date: "August 25, 2026",
    icon: Flag,
    color:
      "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  },
];

export default function UpcomingEvents() {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Upcoming Events
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Important reservations, maintenance schedules, and holidays.
        </p>
      </div>

      <div className="space-y-5">
        {events.map((event) => {
          const Icon = event.icon;

          return (
            <div
              key={event.id}
              className="flex items-start gap-4"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${event.color}`}
              >
                <Icon className="h-6 w-6" />
              </div>

              <div className="flex-1">
                <h4 className="font-semibold text-zinc-900 dark:text-white">
                  {event.title}
                </h4>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {event.description}
                </p>

                <p className="mt-2 text-xs font-medium text-zinc-400">
                  {event.date}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}