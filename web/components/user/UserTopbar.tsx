"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Menu,
  Mountain,
  UserRound,
} from "lucide-react";

import ThemeToggle from "@/components/theme/ThemeToggle";
import NotificationBell from "@/components/shared/notifications/NotificationBell";

type UserTopbarProps = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function getPageTitle(pathname: string) {
  if (pathname === "/user") return "Browse Packages";
  if (pathname.startsWith("/user/book")) return "Book a Package";
  if (pathname.startsWith("/user/reservations")) return "My Reservations";
  if (pathname.startsWith("/user/announcements")) return "Announcements";
  if (pathname.startsWith("/user/profile")) return "My Profile";

  return "E-PULAG Portal";
}

export default function UserTopbar({ setIsOpen }: UserTopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name?.trim() || "User";
  const userEmail = session?.user?.email || "Visitor";
  const initial = userName.charAt(0).toUpperCase() || "U";
  const pageTitle = getPageTitle(pathname);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleSignOut() {
    setDropdownOpen(false);

    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="flex min-h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Mountain className="hidden h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400 sm:block" />

              <h1 className="truncate text-base font-bold tracking-tight text-zinc-900 dark:text-white sm:text-lg">
                {pageTitle}
              </h1>
            </div>

            <p className="mt-1 hidden truncate text-xs text-zinc-500 dark:text-zinc-400 sm:block">
              Your Mount Pulag journey starts here.
            </p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle
            className="h-10 w-10 rounded-xl"
            iconSize="h-5 w-5"
          />

          {/* Functional Notifications */}
          <NotificationBell />

          {/* Profile menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
              aria-label="Open profile menu"
              onClick={() => setDropdownOpen((value) => !value)}
              className="flex min-h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white p-1.5 transition hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-900 sm:gap-3 sm:px-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-sm font-bold text-white">
                {initial}
              </div>

              <div className="hidden min-w-0 text-left xl:block">
                <p className="max-w-36 truncate text-sm font-semibold text-zinc-900 dark:text-white">
                  {userName}
                </p>

                <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                  Visitor account
                </p>
              </div>

              <ChevronDown
                className={`hidden h-4 w-4 shrink-0 text-zinc-500 transition-transform sm:block ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-3 w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl shadow-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-3 border-b border-zinc-100 px-3 py-3 dark:border-zinc-800">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                    {initial}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                      {userName}
                    </p>

                    <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {userEmail}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/user/profile");
                  }}
                  className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-emerald-50 hover:text-emerald-900 dark:text-zinc-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                >
                  <UserRound className="h-4 w-4" />
                  My Profile
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void handleSignOut()}
                  className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
0