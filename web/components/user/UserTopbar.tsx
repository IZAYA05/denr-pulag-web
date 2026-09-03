"use client";

import {
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";

import ThemeToggle from "@/components/theme/ThemeToggle";

type UserTopbarProps = {
  setIsOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
};

export default function UserTopbar({
  setIsOpen,
}: UserTopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="flex h-[72px] items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-xl p-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-900 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Dashboard
            </h1>

            <p className="text-sm text-zinc-500">
              Welcome back to E-PULAG.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle
            className="h-10 w-10 rounded-2xl"
            iconSize="h-5 w-5"
          />

          <button className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white transition hover:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900">
            <Bell className="h-5 w-5" />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />
          </button>

          <button className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-1.5 transition hover:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
              U
            </div>

            <div className="hidden text-left xl:block">
              <p className="font-medium text-zinc-900 dark:text-white">
                User
              </p>

              <p className="text-xs text-zinc-500">
                Visitor
              </p>
            </div>

            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}