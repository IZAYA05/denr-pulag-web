import { Bell, ClipboardList, Users, ShieldCheck } from "lucide-react";

import Card from "@/components/ui/Card";

const notificationEvents = [
  {
    title: "Direct Reservation Updates",
    description:
      "Administrators and employees are notified when direct reservations are submitted or cancelled. Reservation decisions notify the reservation owner.",
    recipients: "DENR Staff and Reservation Owner",
    icon: ClipboardList,
  },
  {
    title: "Package Booking Submissions",
    description:
      "The package Organizer is notified when a tourist submits or cancels a package booking.",
    recipients: "Package Organizer",
    icon: Users,
  },
  {
    title: "Organizer Decisions",
    description:
      "Tourists are notified when the package Organizer approves or rejects their booking.",
    recipients: "Tourist",
    icon: Bell,
  },
  {
    title: "Final DENR Decisions",
    description:
      "Both the tourist and package Organizer are notified when DENR approves or rejects an Organizer-approved package booking.",
    recipients: "Tourist and Package Organizer",
    icon: ShieldCheck,
  },
];

export default function NotificationSettings() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Notification Behavior
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Overview of the notification events currently handled by E-PULAG.
        </p>
      </div>

      <div className="space-y-4">
        {notificationEvents.map((event) => {
          const Icon = event.icon;

          return (
            <div
              key={event.title}
              className="flex flex-col gap-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800 sm:flex-row"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h4 className="font-semibold text-zinc-900 dark:text-white">
                  {event.title}
                </h4>

                <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  {event.description}
                </p>

                <p className="mt-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Recipients: {event.recipients}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 rounded-xl bg-zinc-50 p-4 text-xs leading-5 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
        Notifications are generated automatically by system events.
        Individual notification preferences are not currently configurable
        from this page.
      </p>
    </Card>
  );
}
