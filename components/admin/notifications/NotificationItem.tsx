import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Mountain,
  UserPlus,
} from "lucide-react";

type NotificationType =
  | "reservation"
  | "approved"
  | "announcement"
  | "maintenance"
  | "user";

type NotificationItemProps = {
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  unread?: boolean;
};

export default function NotificationItem({
  type,
  title,
  description,
  time,
  unread = false,
}: NotificationItemProps) {
  const config = {
    reservation: {
      icon: CalendarDays,
      color:
        "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    },
    approved: {
      icon: CheckCircle2,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
    announcement: {
      icon: Bell,
      color:
        "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    },
    maintenance: {
      icon: Mountain,
      color:
        "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    },
    user: {
      icon: UserPlus,
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
    },
  };

  const Icon = config[type].icon;

  return (
    <button
      className={`relative flex w-full items-start gap-4 rounded-2xl p-4 text-left transition hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
        unread ? "bg-emerald-50/60 dark:bg-emerald-500/5" : ""
      }`}
    >
      {/* Unread Dot */}

      {unread && (
        <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-emerald-500" />
      )}

      {/* Icon */}

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config[type].color}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}

      <div className="min-w-0 flex-1">
        <h4 className="font-medium text-zinc-900 dark:text-white">
          {title}
        </h4>

        <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>

        <p className="mt-2 text-xs text-zinc-400">
          {time}
        </p>
      </div>
    </button>
  );
}