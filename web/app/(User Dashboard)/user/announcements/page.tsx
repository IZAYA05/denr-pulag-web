
"use client";

import {
  BellRing,
  CalendarDays,
  Megaphone,
} from "lucide-react";

export default function AnnouncementsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-emerald-950 px-6 py-9 text-white sm:px-9 sm:py-12">
        <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-100">
            <Megaphone className="h-4 w-4" />
            Stay informed
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Announcements
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-100/80 sm:text-base">
            Stay updated with the latest news, reminders, and
            important information from Mount Pulag National Park.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <BellRing className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Latest Announcements
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              News and updates for visitors
            </p>
          </div>
        </div>

        <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950/50">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              General Information
            </span>
          </div>

          <div className="p-6 sm:p-8">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Announcement Title
            </h3>

            <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <CalendarDays className="h-4 w-4" />
              Publication date
            </div>

            <p className="mt-5 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              This is a sample announcement. Important updates,
              visitor reminders, park advisories, and other
              information will be displayed here when published.
            </p>
          </div>

          <div className="border-t border-zinc-100 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              E-PULAG • Mount Pulag Booking System
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
