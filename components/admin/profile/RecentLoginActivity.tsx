import {
  Monitor,
  Smartphone,
  Clock,
  MapPin,
} from "lucide-react";

const activities = [
  {
    id: 1,
    device: "Windows PC",
    browser: "Google Chrome",
    icon: Monitor,
    location: "Bokod, Benguet",
    time: "Today • 2:45 PM",
    current: true,
  },
  {
    id: 2,
    device: "Android Phone",
    browser: "Google Chrome",
    icon: Smartphone,
    location: "Bokod, Benguet",
    time: "Yesterday • 8:17 PM",
    current: false,
  },
  {
    id: 3,
    device: "Windows PC",
    browser: "Microsoft Edge",
    icon: Monitor,
    location: "Bokod, Benguet",
    time: "July 28, 2026 • 10:30 AM",
    current: false,
  },
];

export default function RecentLoginActivity() {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Recent Login Activity
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Review recent devices that have accessed your account.
        </p>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 rounded-2xl border border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-medium text-zinc-900 dark:text-white">
                    {activity.device}
                  </h4>

                  {activity.current && (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      Current Session
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    {activity.browser}
                  </span>

                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {activity.location}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {activity.time}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}