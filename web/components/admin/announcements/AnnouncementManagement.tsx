"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Bell, CalendarClock, Edit3, Plus, RefreshCw, Search, Trash2 } from "lucide-react";

import { useDashboard } from "@/components/admin/DashboardClient";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

type AnnouncementStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED";
type Announcement = {
  id: number;
  title: string;
  content: string;
  status: AnnouncementStatus;
  publish_at?: string | null;
  created_at: string;
};
type ApiResponse = {
  announcements?: Announcement[];
  message?: string;
  errors?: Record<string, string | string[]>;
};

function getMessage(data: ApiResponse, fallback: string) {
  const firstError = Object.values(data.errors ?? {})
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .find((value): value is string => typeof value === "string");
  return firstError || data.message || fallback;
}

function formatDate(value?: string | null) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(date);
}

function statusVariant(status: AnnouncementStatus) {
  if (status === "PUBLISHED") return "success" as const;
  if (status === "SCHEDULED") return "info" as const;
  return "warning" as const;
}

export default function AnnouncementManagement() {
  const { accessToken } = useDashboard();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<AnnouncementStatus>("DRAFT");
  const [publishAt, setPublishAt] = useState("");

  const loadAnnouncements = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      setError("Your session is missing an API access token. Please sign in again.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/admin/announcements`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok) throw new Error(getMessage(data, "Unable to load announcements."));
      setAnnouncements(Array.isArray(data.announcements) ? data.announcements : []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load announcements.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void Promise.resolve().then(loadAnnouncements);
  }, [loadAnnouncements]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return announcements.filter((item) => {
      const matchesSearch = !query || item.title.toLowerCase().includes(query) || item.content.toLowerCase().includes(query);
      const matchesStatus = filter === "ALL" || item.status === filter;
      return matchesSearch && matchesStatus;
    });
  }, [announcements, search, filter]);

  function openCreate() {
    setEditingId(null);
    setTitle("");
    setContent("");
    setStatus("DRAFT");
    setPublishAt("");
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEdit(item: Announcement) {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setStatus(item.status);
    if (item.publish_at) {
      const date = new Date(item.publish_at);
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      setPublishAt(local.toISOString().slice(0, 16));
    } else {
      setPublishAt("");
    }
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  async function saveAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/announcements${editingId ? `/${editingId}` : ""}`,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            status,
            publish_at: status === "SCHEDULED" ? publishAt : null,
          }),
        }
      );
      const data = (await response.json()) as ApiResponse;
      if (!response.ok) throw new Error(getMessage(data, "Unable to save announcement."));

      setModalOpen(false);
      setSuccess(data.message || "Announcement saved.");
      await loadAnnouncements();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save announcement.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAnnouncement(item: Announcement) {
    if (!accessToken || !window.confirm(`Delete the announcement “${item.title}”?`)) return;
    setDeletingId(item.id);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/api/admin/announcements/${item.id}`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok) throw new Error(getMessage(data, "Unable to delete announcement."));
      setAnnouncements((current) => current.filter((entry) => entry.id !== item.id));
      setSuccess(data.message || "Announcement deleted.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete announcement.");
    } finally {
      setDeletingId(null);
    }
  }

  const publishedCount = announcements.filter((item) => item.status === "PUBLISHED").length;
  const draftCount = announcements.filter((item) => item.status === "DRAFT").length;
  const scheduledCount = announcements.filter((item) => item.status === "SCHEDULED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2" aria-hidden="true"><Bell className="h-5 w-5 text-emerald-600" /></div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => void loadAnnouncements()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button type="button" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />New announcement</Button>
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
      {success && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">{success}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Published", value: publishedCount, color: "text-emerald-600" },
          { label: "Scheduled", value: scheduledCount, color: "text-blue-600" },
          { label: "Drafts", value: draftCount, color: "text-amber-600" },
        ].map((stat) => <Card key={stat.label} className="p-5"><p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p><p className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</p></Card>)}
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search announcements..." className="w-full rounded-xl border border-zinc-200 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700" /></div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"><option value="ALL">All statuses</option><option value="PUBLISHED">Published</option><option value="SCHEDULED">Scheduled</option><option value="DRAFT">Draft</option></select>
        </div>

        <div className="mt-5 space-y-3">
          {loading ? <p className="py-8 text-center text-sm text-zinc-500">Loading announcements...</p> : filtered.length === 0 ? (
            <div className="py-10 text-center"><Bell className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-700" /><p className="mt-3 font-semibold text-zinc-800 dark:text-zinc-200">No announcements found</p><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Create an announcement to publish information for visitors.</p></div>
          ) : filtered.map((item) => (
            <article key={item.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-zinc-900 dark:text-white">{item.title}</h2><Badge variant={statusVariant(item.status)}>{item.status}</Badge></div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.content}</p>
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-zinc-400"><CalendarClock className="h-3.5 w-3.5" />{item.status === "SCHEDULED" ? `Scheduled: ${formatDate(item.publish_at)}` : item.status === "PUBLISHED" ? `Published: ${formatDate(item.publish_at || item.created_at)}` : `Draft · Created ${formatDate(item.created_at)}`}</p>
                </div>
                <div className="flex shrink-0 gap-2"><Button type="button" variant="outline" onClick={() => openEdit(item)}><Edit3 className="mr-2 h-4 w-4" />Edit</Button><Button type="button" variant="danger" disabled={deletingId === item.id} onClick={() => void deleteAnnouncement(item)}><Trash2 className="mr-2 h-4 w-4" />{deletingId === item.id ? "Deleting..." : "Delete"}</Button></div>
              </div>
            </article>
          ))}
        </div>
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <form onSubmit={saveAnnouncement} className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-950 sm:p-6">
            <div><h2 className="text-xl font-bold text-zinc-900 dark:text-white">{editingId ? "Edit announcement" : "New announcement"}</h2><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Drafts are visible only to administrators. Published announcements appear in the visitor feed.</p></div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Title<input required maxLength={255} value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900" /></label>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Content<textarea required rows={7} maxLength={20000} value={content} onChange={(event) => setContent(event.target.value)} className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Status<select value={status} onChange={(event) => setStatus(event.target.value as AnnouncementStatus)} className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published now</option><option value="SCHEDULED">Schedule</option></select></label>
              {status === "SCHEDULED" && <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Publish date and time<input type="datetime-local" required value={publishAt} onChange={(event) => setPublishAt(event.target.value)} className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900" /></label>}
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800"><Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving || !title.trim() || !content.trim() || (status === "SCHEDULED" && !publishAt)}>{saving ? "Saving..." : editingId ? "Save changes" : "Save announcement"}</Button></div>
          </form>
        </div>
      )}
    </div>
  );
}
