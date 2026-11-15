"use client";

import { useEffect, useState } from "react";
import { BellRing, CalendarDays } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

type Announcement = {
  id: number;
  title: string;
  content: string;
  publish_at?: string | null;
  created_at: string;
};
type ApiResponse = { announcements?: Announcement[]; message?: string };

function formatDate(value?: string | null) {
  if (!value) return "Publication date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "long", timeZone: "Asia/Manila" }).format(date);
}

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch(`${API_URL}/api/announcements`, { headers: { Accept: "application/json" }, cache: "no-store" });
        const data = (await response.json()) as ApiResponse;
        if (!response.ok) throw new Error(data.message || "Unable to load announcements.");
        if (active) setAnnouncements(data.announcements || []);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "Unable to load announcements.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"><BellRing className="h-5 w-5" /></div>
        <div><h2 className="text-xl font-bold text-zinc-900 dark:text-white">Latest Announcements</h2><p className="text-sm text-zinc-500 dark:text-zinc-400">News and updates for visitors</p></div>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
      {loading ? <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">Loading announcements...</div> : announcements.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <BellRing className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-700" />
          <h3 className="mt-3 font-semibold text-zinc-900 dark:text-white">No published announcements</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">DENR updates will appear here when they are published.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <article key={announcement.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950/50"><span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">DENR Announcement</span></div>
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{announcement.title}</h3>
                <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400"><CalendarDays className="h-4 w-4" />{formatDate(announcement.publish_at || announcement.created_at)}</div>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-zinc-600 dark:text-zinc-300">{announcement.content}</p>
              </div>
              <div className="border-t border-zinc-100 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950/50"><p className="text-xs text-zinc-500 dark:text-zinc-400">E-PULAG · Mount Pulag Booking System</p></div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
