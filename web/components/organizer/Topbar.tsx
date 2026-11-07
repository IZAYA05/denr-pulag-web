"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import { ChevronDown, Menu, Search } from "lucide-react";

import ThemeToggle from "@/components/theme/ThemeToggle";
import NotificationBell from "@/components/shared/notifications/NotificationBell";

type TopbarProps = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Topbar({ setIsOpen }: TopbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const pageTitle = useMemo(() => {
    const routes: Record<string, string> = {
      "/organizer": "Dashboard",
      "/organizer/packages": "My Packages",
      "/organizer/bookings": "Package Bookings",
      "/organizer/groups": "Groups",
      "/organizer/profile": "Profile",
    };

    if (pathname.startsWith("/organizer/packages/")) {
      return "My Packages";
    }

    if (pathname.startsWith("/organizer/bookings/")) {
      return "Package Bookings";
    }

    if (pathname.startsWith("/organizer/groups/")) {
      return "Groups";
    }

    return routes[pathname] ?? "Dashboard";
  }, [pathname]);

  async function handleLogout() {
    await signOut({
      callbackUrl: "/",
    });
  }

  const firstName =
    session?.user?.firstName ||
    session?.user?.name?.split(" ")[0] ||
    "Organizer";

  const lastName = session?.user?.lastName || "";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="flex h-[72px] items-center justify-between px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          {/* Mobile Sidebar Toggle */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation"
            className="rounded-xl p-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-900 lg:hidden"
          >
            <Menu className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
          </button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {pageTitle}
            </h1>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Welcome back to your E-PULAG Organizer Portal.
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
              aria-label="Search"
              className="w-72 rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:bg-zinc-950"
            />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle
            className="h-10 w-10 rounded-2xl"
            iconSize="h-5 w-5"
          />

          {/* Notifications */}
          <NotificationBell />

          {/* Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-label="Open organizer profile menu"
              aria-expanded={isProfileOpen}
              className="
                flex
                h-10
                cursor-pointer
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
                {initials}
              </div>

              <div className="hidden text-left xl:block">
                <p className="font-medium text-zinc-900 dark:text-white">
                  {firstName} {lastName}
                </p>

                <p className="text-xs text-zinc-500">
                  Organizer
                </p>
              </div>

              <ChevronDown
                className={`h-4 w-4 transition ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                <Link
                  href="/organizer/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="block px-5 py-3 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Profile
                </Link>

                <hr className="border-zinc-200 dark:border-zinc-700" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-5 py-3 text-left text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
