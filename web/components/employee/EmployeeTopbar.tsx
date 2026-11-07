"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  ChevronDown,
  LogOut,
  Menu,
  Search,
  UserRound,
} from "lucide-react";

import ThemeToggle from "@/components/theme/ThemeToggle";
import NotificationBell from "@/components/shared/notifications/NotificationBell";

type EmployeeTopbarProps = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function EmployeeTopbar({
  setIsOpen,
}: EmployeeTopbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");

  const pageTitle = useMemo(() => {
    const routes: Record<string, string> = {
      "/employee": "Dashboard",
      "/employee/bookings": "Bookings",
      "/employee/visitors": "Visitors",
      "/employee/reports": "Daily Reports",
      "/employee/trails": "Trail Schedules",
      "/employee/profile": "My Profile",
    };

    if (routes[pathname]) return routes[pathname];

    if (pathname.startsWith("/employee/bookings/")) {
      return "Booking Details";
    }

    return "Employee Workspace";
  }, [pathname]);

  const firstName = session?.user?.firstName;
  const lastName = session?.user?.lastName;

  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    session?.user?.name ||
    "Employee";

  const initials =
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "E";

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="flex h-[72px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setIsOpen(true)}
            className="rounded-xl p-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-900 lg:hidden"
          >
            <Menu className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
              {pageTitle}
            </h1>

            <p className="hidden text-sm text-zinc-500 dark:text-zinc-400 sm:block">
              Welcome back to E-PULAG Employee Workspace.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Search */}
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();

              const query = search.trim();
              if (!query) return;

              const target =
                pathname.startsWith("/employee/visitors")
                  ? "/employee/visitors"
                  : pathname.startsWith("/employee/trails")
                    ? "/employee/trails"
                    : "/employee/bookings";

              window.location.href = `${target}?search=${encodeURIComponent(query)}`;
            }}
            className="relative hidden lg:block"
          >
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              aria-label="Search current employee section"
              className="w-48 rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 pl-11 pr-4 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:bg-zinc-950 xl:w-64"
            />
          </form>

          {/* Theme Toggle */}
          <ThemeToggle
            className="h-10 w-10 rounded-2xl"
            iconSize="h-5 w-5"
          />

          {/* Notifications */}
          <NotificationBell />

          {/* Profile Menu */}
          <details className="group relative">
            <summary
              className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-2 transition-all hover:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 sm:px-3"
              aria-label="Employee account menu"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  initials || <UserRound className="h-4 w-4" />
                )}
              </div>

              <div className="hidden max-w-36 text-left xl:block">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                  {fullName}
                </p>

                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Employee
                </p>
              </div>

              <ChevronDown className="hidden h-4 w-4 text-zinc-500 transition group-open:rotate-180 sm:block" />
            </summary>

            <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                  {fullName}
                </p>

                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {session?.user?.email || "Employee account"}
                </p>
              </div>

              <Link
                href="/employee/profile"
                className="block px-5 py-3 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                My Profile
              </Link>

              <hr className="border-zinc-200 dark:border-zinc-700" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-5 py-3 text-left text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
