"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

import NotificationBadge from "./NotificationBadge";
import NotificationDropdown from "./NotificationDropdown";
import {
  NotificationProvider,
  useNotifications,
} from "./NotificationContext";

function NotificationBellContent() {
  const { unreadCount } = useNotifications();

  const [open, setOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={notificationRef} className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Notifications"
        onClick={() => setOpen((value) => !value)}
        className="
          relative
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-2xl
          border
          border-zinc-200
          bg-white
          text-zinc-700
          transition-all
          hover:border-emerald-500
          hover:text-emerald-600
          focus:outline-none
          focus:ring-2
          focus:ring-emerald-500/30
          dark:border-zinc-700
          dark:bg-zinc-900
          dark:text-zinc-200
          dark:hover:border-emerald-500
        "
      >
        <Bell className="h-5 w-5" />

        <NotificationBadge count={unreadCount} />
      </button>

      <NotificationDropdown
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

export default function NotificationBell() {
  return (
    <NotificationProvider>
      <NotificationBellContent />
    </NotificationProvider>
  );
}
