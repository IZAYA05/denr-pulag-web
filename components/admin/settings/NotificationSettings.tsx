export default function NotificationSettings() {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Notification Settings
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Choose which system notifications are enabled.
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            title: "Reservation Confirmation",
            description:
              "Notify users when their reservation is approved.",
          },
          {
            title: "Reservation Cancellation",
            description:
              "Notify users when a reservation is cancelled.",
          },
          {
            title: "Trail Maintenance Alerts",
            description:
              "Notify users when a trail enters maintenance.",
          },
          {
            title: "System Announcements",
            description:
              "Broadcast important announcements to users.",
          },
          {
            title: "New User Notifications",
            description:
              "Notify administrators when a new staff account is created.",
          },
        ].map((setting) => (
          <div
            key={setting.title}
            className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4 dark:border-zinc-700"
          >
            <div>
              <h4 className="font-medium text-zinc-900 dark:text-white">
                {setting.title}
              </h4>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {setting.description}
              </p>
            </div>

            <input
              type="checkbox"
              defaultChecked
              className="h-5 w-5 accent-emerald-600"
            />
          </div>
        ))}
      </div>
    </div>
  );
}