"use client";

import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Megaphone,
  Package,
  Mountain,
  Users,
} from "lucide-react";

import type { AppNotification } from "./NotificationContext";

type NotificationItemProps = {
  notification: AppNotification;
  onSelect: (notification: AppNotification) => void;
};

const notificationConfig: Record<
  string,
  {
    icon: typeof Bell;
    color: string;
    label: string;
  }
> = {
  reservation: {
    icon: CalendarDays,
    color:
      "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    label: "Reservation",
  },
  package_booking: {
    icon: Package,
    color:
      "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
    label: "Package Booking",
  },
  approved: {
    icon: CheckCircle2,
    color:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    label: "Approved",
  },
  announcement: {
    icon: Megaphone,
    color:
      "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    label: "Announcement",
  },
  maintenance: {
    icon: Mountain,
    color:
      "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    label: "Maintenance",
  },
  user: {
    icon: Users,
    color:
      "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
    label: "Account",
  },
  general: {
    icon: Bell,
    color:
      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
    label: "General",
  },
};

function formatNotificationType(type: string) {
  return notificationConfig[type]?.label || "Notification";
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function NotificationItem({
  notification,
  onSelect,
}: NotificationItemProps) {
  const type = notification.data.type || "general";

  const config =
    notificationConfig[type] || notificationConfig.general;

  const Icon = config.icon;
  const unread = notification.read_at === null;

  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className={`relative flex w-full items-start gap-4 border-b border-zinc-100 p-4 text-left transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 ${
        unread ? "bg-emerald-50/60 dark:bg-emerald-500/5" : ""
      }`}
    >
      {unread && (
        <span
          className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-emerald-500"
          aria-label="Unread"
        />
      )}

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config.color}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1 pr-3">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-medium text-zinc-900 dark:text-white">
            {notification.data.title || "Notification"}
          </h4>

          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {formatNotificationType(type)}
          </span>
        </div>

        <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
          {notification.data.message || "You have a new notification."}
        </p>

        <p className="mt-2 text-xs text-zinc-400">
          {formatTime(notification.created_at)}
        </p>
      </div>
    </button>
  );
}
