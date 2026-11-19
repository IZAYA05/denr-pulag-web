"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Users } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";
type Booking = { id: number; booking_number: string; hiking_date: string; tourist_count: number; status: string; denr_status?: string | null; package?: { name?: string } | null; trail?: { name?: string } | null; customer?: { first_name?: string; last_name?: string } | null };
type ApiResponse = { bookings?: Booking[]; message?: string };

function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function parseDate(value: string) { const [y, m, d] = value.slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); }
function labelDate(value: string) { return new Intl.DateTimeFormat("en-PH", { month: "long", day: "numeric", year: "numeric" }).format(parseDate(value)); }

export default function OrganizerCalendar() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let active = true;
    async function load() {
      setLoading(true); setError("");
      try {
        const response = await fetch(`${API_URL}/api/package-bookings`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, cache: "no-store" });
        const data = (await response.json()) as ApiResponse;
        if (!response.ok) throw new Error(data.message || "Unable to load the booking calendar.");
        if (active) setBookings(data.bookings || []);
      } catch (caught) { if (active) setError(caught instanceof Error ? caught.message : "Unable to load the booking calendar."); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [token]);

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, index) => { const day = new Date(start); day.setDate(start.getDate() + index); return day; });
  }, [month]);

  const byDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((booking) => { const key = booking.hiking_date.slice(0, 10); map.set(key, [...(map.get(key) || []), booking]); });
    return map;
  }, [bookings]);

  const selectedBookings = byDate.get(selectedDate) || [];
  const monthLabel = new Intl.DateTimeFormat("en-PH", { month: "long", year: "numeric" }).format(month);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
      <Card className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-emerald-600" /><h2 className="font-semibold text-zinc-900 dark:text-white">{monthLabel}</h2></div>
          <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></Button><Button type="button" variant="outline" onClick={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelectedDate(dateKey(now)); }}>Today</Button><Button type="button" variant="outline" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight className="h-4 w-4" /></Button></div>
        </div>
        {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-500">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="py-2">{day}</div>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = dateKey(day); const events = byDate.get(key) || []; const inMonth = day.getMonth() === month.getMonth(); const selected = key === selectedDate;
            return <button key={key} type="button" onClick={() => setSelectedDate(key)} className={`min-h-[82px] rounded-xl border p-2 text-left transition ${selected ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20 dark:bg-emerald-950/30" : "border-zinc-100 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-600"} ${inMonth ? "" : "opacity-35"}`}>
              <span className={`text-xs font-semibold ${selected ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-700 dark:text-zinc-300"}`}>{day.getDate()}</span>
              {events.slice(0, 2).map((booking) => <span key={booking.id} className="mt-1 block truncate rounded-md bg-emerald-100 px-1 py-0.5 text-[9px] font-medium text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">{booking.package?.name || "Booking"}</span>)}
              {events.length > 2 && <span className="mt-1 block text-[9px] text-zinc-500">+{events.length - 2} more</span>}
            </button>;
          })}
        </div>
        {loading && token && <p className="mt-4 text-center text-xs text-zinc-500">Loading bookings...</p>}
      </Card>
      <Card className="p-5 sm:p-6">
        <h2 className="font-semibold text-zinc-900 dark:text-white">{labelDate(selectedDate)}</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{selectedBookings.length} package booking{selectedBookings.length === 1 ? "" : "s"}</p>
        {selectedBookings.length === 0 ? <div className="flex flex-col items-center py-12 text-center"><CalendarDays className="h-8 w-8 text-zinc-300" /><p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">No trips scheduled</p></div> : <div className="mt-5 space-y-3">{selectedBookings.map((booking) => <div key={booking.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"><p className="font-semibold text-zinc-900 dark:text-white">{booking.package?.name || "Package booking"}</p><p className="mt-1 text-xs text-zinc-500">{booking.booking_number}</p><div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500"><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{booking.trail?.name || "Trail not specified"}</span><span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{booking.tourist_count} tourists</span></div><p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">{booking.status} · DENR {booking.denr_status || "Pending"}</p></div>)}</div>}
      </Card>
    </div>
  );
}
