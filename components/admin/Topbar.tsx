"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";

import ThemeToggle from "@/components/theme/ThemeToggle";

import NotificationBadge from "@/components/admin/notifications/NotificationBadge";
import NotificationDropdown from "@/components/admin/notifications/NotificationDropdown";

type TopbarProps = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Topbar({
  setIsOpen,
}: TopbarProps) {
  const pathname = usePathname();

  const [openNotifications, setOpenNotifications] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = 2;

  const pageTitle = useMemo(() => {
    const routes: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/reservations": "Reservations",
      "/visitors": "Visitors",
      "/trails": "Trails",
      "/calendar": "Calendar",
      "/announcements": "Announcements",
      "/reports": "Reports",
      "/users": "Users",
      "/profile": "Profile",
      "/settings": "Settings",
    };

    return routes[pathname] ?? "Dashboard";
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setOpenNotifications(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="flex h-[72px] items-center justify-between px-6">
        {/* Left */}

        <div className="flex items-center gap-4">
          {/* Mobile Sidebar Toggle */}

          <button
            onClick={() => setIsOpen(true)}
            className="rounded-xl p-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-900 lg:hidden"
          >
            <Menu className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
          </button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {pageTitle}
            </h1>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Welcome back to E-PULAG Administration.
            </p>
          </div>
        </div>

        {/* Right */}

        <div className="flex items-center gap-4">
          {/* Search */}

          <div className="relative hidden lg:block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              type="text"
              placeholder="Search..."
              className="w-72 rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:bg-zinc-950"
            />
          </div>

          {/* Theme Toggle */}

          <ThemeToggle
            className="h-10 w-10 rounded-2xl"
            iconSize="h-5 w-5"
          />

          {/* Notifications */}

          <div
            ref={notificationRef}
            className="relative"
          >
            <button
              onClick={() =>
                setOpenNotifications(!openNotifications)
              }
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
                transition-all
                hover:border-emerald-500
                hover:text-emerald-600
                dark:border-zinc-700
                dark:bg-zinc-900
                dark:hover:border-emerald-500
              "
            >
              <Bell className="h-5 w-5" />

              <NotificationBadge
                count={unreadNotifications}
              />
            </button>

            <NotificationDropdown
              open={openNotifications}
            />
          </div>
                    {/* Profile */}

          <details className="group relative">
            <summary
              className="
                flex
                h-10
                cursor-pointer
                list-none
                items-center
                gap-2
                rounded-2xl
                border
                border-zinc-200
                bg-white
                px-3
                transition-all
                hover:border-emerald-500
                dark:border-zinc-700
                dark:bg-zinc-900
              "
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                A
              </div>

              <div className="hidden text-left xl:block">
                <p className="font-medium text-zinc-900 dark:text-white">
                  Administrator
                </p>

                <p className="text-xs text-zinc-500">
                  DENR - Bokod
                </p>
              </div>

              <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>

            {/* Dropdown */}

            <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
              <Link
                href="/profile"
                className="block px-5 py-3 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Profile
              </Link>

              <Link
                href="/settings"
                className="block px-5 py-3 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Settings
              </Link>

              <hr className="border-zinc-200 dark:border-zinc-700" />

              <button className="w-full px-5 py-3 text-left text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30">
                Logout
              </button>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}