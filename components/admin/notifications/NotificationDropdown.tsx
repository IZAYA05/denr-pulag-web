"use client";

import { Bell, CheckCheck } from "lucide-react";

import NotificationItem from "./NotificationItem";

type NotificationDropdownProps = {
  open: boolean;
};

const notifications = [
  {
    id: 1,
    type: "reservation" as const,
    title: "New Reservation",
    description: "Juan Dela Cruz submitted a reservation request.",
    time: "2 minutes ago",
    unread: true,
  },
  {
    id: 2,
    type: "approved" as const,
    title: "Reservation Approved",
    description: "Maria Santos' reservation has been approved.",
    time: "15 minutes ago",
    unread: true,
  },
  {
    id: 3,
    type: "announcement" as const,
    title: "Announcement Published",
    description: "Weather Advisory has been published.",
    time: "1 hour ago",
    unread: false,
  },
  {
    id: 4,
    type: "maintenance" as const,
    title: "Trail Maintenance",
    description: "Ambangeg Trail will be closed tomorrow.",
    time: "Yesterday",
    unread: false,
  },
];

export default function NotificationDropdown({
  open,
}: NotificationDropdownProps) {
  if (!open) return null;

  return (
    <div className="absolute right-0 top-14 z-50 w-[400px] overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
      {/* Header */}

      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-emerald-600" />

          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              Notifications
            </h3>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {notifications.filter((n) => n.unread).length} unread
            </p>
          </div>
        </div>

        <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-emerald-600 transition hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
          <CheckCheck className="h-4 w-4" />

          Mark all
        </button>
      </div>

      {/* Notifications */}

      <div className="max-h-[420px] overflow-y-auto">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            type={notification.type}
            title={notification.title}
            description={notification.description}
            time={notification.time}
            unread={notification.unread}
          />
        ))}
      </div>

      {/* Footer */}

      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <button className="w-full rounded-2xl border border-zinc-200 py-3 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
          View Notification History
        </button>
      </div>
    </div>
  );
}