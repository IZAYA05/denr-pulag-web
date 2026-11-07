"use client";

import { useRouter } from "next/navigation";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";

import Button from "@/components/ui/Button";

import NotificationItem from "./NotificationItem";
import { useNotifications } from "./NotificationContext";
import type { AppNotification } from "./NotificationContext";

type NotificationDropdownProps = {
  open: boolean;
  onClose: () => void;
};

export default function NotificationDropdown({
  open,
  onClose,
}: NotificationDropdownProps) {
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  if (!open) return null;

  async function handleNotificationSelect(
    notification: AppNotification
  ) {
    if (notification.read_at === null) {
      await markAsRead(notification.id);
    }

    onClose();

    const target = notification.data.url;

    if (typeof target === "string" && target.startsWith("/")) {
      router.push(target);
    }
  }

  async function handleMarkAll() {
    await markAllAsRead();
  }

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-14 z-50 w-[min(400px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />

          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              Notifications
            </h3>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {unreadCount} unread
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="shrink-0 px-2 py-2 text-xs text-emerald-600 dark:text-emerald-400"
          disabled={unreadCount === 0}
          onClick={() => void handleMarkAll()}
        >
          <CheckCheck className="mr-1.5 h-4 w-4" />
          Mark all
        </Button>
      </div>

      {/* Notification list */}
      <div className="max-h-[420px] overflow-y-auto">
        {loading && notifications.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Loading notifications...
          </div>
        ) : error && notifications.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => void refreshNotifications()}
            >
              Try Again
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900">
              <Bell className="h-6 w-6" />
            </div>

            <h4 className="mt-3 font-medium text-zinc-900 dark:text-white">
              No notifications yet
            </h4>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              New updates will appear here.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onSelect={handleNotificationSelect}
            />
          ))
        )}
      </div>

      {/* Error notice */}
      {error && notifications.length > 0 && (
        <div
          role="alert"
          className="border-t border-red-200 bg-red-50 px-5 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
        <p className="text-xs text-zinc-400">
          Showing latest {notifications.length} notifications
        </p>

        <Button
          type="button"
          variant="outline"
          className="px-3 py-2 text-xs"
          disabled={loading}
          onClick={() => void refreshNotifications()}
        >
          <RefreshCw
            className={`mr-1.5 h-3.5 w-3.5 ${
              loading ? "animate-spin" : ""
            }`}
          />
          Refresh
        </Button>
      </div>
    </div>
  );
}
