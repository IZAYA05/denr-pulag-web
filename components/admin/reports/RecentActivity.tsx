import {
  CalendarCheck,
  Mountain,
  UserPlus,
  CheckCircle2,
} from "lucide-react";

const activities = [
  {
    id: 1,
    title: "Reservation Approved",
    description: "Juan Dela Cruz booked Ambangeg Trail.",
    time: "2 minutes ago",
    icon: CalendarCheck,
    color:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    id: 2,
    title: "Trail Updated",
    description: "Akiki Trail capacity updated to 500 hikers/day.",
    time: "1 hour ago",
    icon: Mountain,
    color:
      "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  {
    id: 3,
    title: "New User Created",
    description: "Maria Santos was added as a Booking Officer.",
    time: "Yesterday",
    icon: UserPlus,
    color:
      "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    id: 4,
    title: "Hike Completed",
    description: "Group #102 successfully completed the Ambangeg Trail.",
    time: "2 days ago",
    icon: CheckCircle2,
    color:
      "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  },
];

export default function RecentActivity() {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Recent Activity
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Latest actions across the reservation system.
        </p>
      </div>

      <div className="space-y-6">
        {activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div
              key={activity.id}
              className="flex items-start gap-4"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${activity.color}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <h4 className="font-medium text-zinc-900 dark:text-white">
                  {activity.title}
                </h4>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {activity.description}
                </p>

                <p className="mt-2 text-xs text-zinc-400">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}