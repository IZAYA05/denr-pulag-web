
"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  UserRound,
} from "lucide-react";

import ThemeToggle from "@/components/theme/ThemeToggle";

type UserTopbarProps = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function UserTopbar({
  setIsOpen,
}: UserTopbarProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName =
    session?.user?.name?.trim() || "User";

  const userEmail = session?.user?.email || "Visitor";

  const initial = userName.charAt(0).toUpperCase() || "U";

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
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
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
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="flex h-[72px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation menu"
            className="rounded-xl p-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-900 lg:hidden"
          >
            <Menu className="h-6 w-6 text-zinc-700 dark:text-zinc-200" />
          </button>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
              E-PULAG
            </h1>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Welcome back to E-PULAG.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle
            className="h-10 w-10 rounded-2xl"
            iconSize="h-5 w-5"
          />

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white transition hover:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <Bell className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
              aria-label="Open profile menu"
              onClick={() =>
                setDropdownOpen((isOpen) => !isOpen)
              }
              className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-2 py-1.5 transition hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-900 sm:px-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                {initial}
              </div>

              <div className="hidden text-left xl:block">
                <p className="max-w-36 truncate font-medium text-zinc-900 dark:text-white">
                  {userName}
                </p>

                <p className="max-w-36 truncate text-xs text-zinc-500 dark:text-zinc-400">
                  Visitor
                </p>
              </div>

              <ChevronDown
                className={`h-4 w-4 text-zinc-500 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl shadow-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="border-b border-zinc-100 px-3 py-3 dark:border-zinc-800">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                    {userName}
                  </p>
                  <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {userEmail}
                  </p>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/user/profile");
                  }}
                  className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <UserRound className="h-4 w-4" />
                  Profile
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void handleSignOut()}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
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
