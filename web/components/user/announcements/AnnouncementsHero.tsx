import { BellRing } from "lucide-react";

export default function AnnouncementsHero() {
  return (
    <section className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/20 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
          <BellRing className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">E-PULAG updates</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">Announcements</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Read published visitor advisories, reservation reminders, and park updates from DENR-Bokod.
          </p>
        </div>
      </div>
    </section>
  );
}
