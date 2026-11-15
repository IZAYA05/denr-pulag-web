"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

type Announcement = { id: number; title: string; content: string; publish_at?: string | null; created_at: string };
type ApiResponse = { announcements?: Announcement[]; message?: string };

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" }).format(date);
}

export default function UserRecentAnnouncements() {
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
        if (active) setAnnouncements((data.announcements || []).slice(0, 3));
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
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Updates</p><h2 className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">Recent Announcements</h2></div><Bell className="h-5 w-5 text-emerald-600" /></div>
      <div className="mt-5 divide-y divide-zinc-200 dark:divide-zinc-800">
        {loading ? <p className="py-4 text-sm text-zinc-500">Loading announcements...</p> : error ? <p role="alert" className="py-4 text-sm text-red-600">{error}</p> : announcements.length === 0 ? <p className="py-4 text-sm text-zinc-500 dark:text-zinc-400">No published announcements yet.</p> : announcements.map((item) => (
          <article key={item.id} className="py-4 first:pt-0 last:pb-0"><h3 className="font-semibold text-zinc-900 dark:text-white">{item.title}</h3><p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">{item.content}</p><p className="mt-2 text-xs text-zinc-400">{formatDate(item.publish_at || item.created_at)}</p></article>
        ))}
      </div>
      <Link href="/user/announcements" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:gap-3">View All Announcements <ArrowRight className="h-4 w-4" /></Link>
    </section>
  );
}
