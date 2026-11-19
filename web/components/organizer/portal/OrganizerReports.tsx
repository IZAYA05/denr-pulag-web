"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Download, FileBarChart2, Users } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";
type Booking = { id: number; booking_number: string; hiking_date: string; tourist_count: number; status: string; denr_status?: string | null; package?: { id: number; name: string; price?: string | number } | null; trail?: { name: string } | null; customer?: { first_name: string; last_name: string } | null };
type PackageItem = { id: number; name: string; status: string; approval_status?: string };
type ApiResponse = { bookings?: Booking[]; packages?: PackageItem[]; message?: string };

function dateValue(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function today() { return dateValue(new Date()); }
function statusOf(booking: Booking) { const status = (booking.status || "").toUpperCase(); const denr = (booking.denr_status || "").toUpperCase(); if (status === "CANCELLED") return "Cancelled"; if (status === "REJECTED" || denr === "REJECTED") return "Rejected"; if (status === "COMPLETED") return "Completed"; if (status === "PENDING") return "Awaiting Organizer"; if (status === "APPROVED" && denr === "PENDING") return "Awaiting DENR"; if (status === "APPROVED" && denr === "APPROVED") return "Confirmed"; return status || "Unknown"; }

export default function OrganizerReports() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [from, setFrom] = useState(() => `${new Date().getFullYear()}-01-01`);
  const [to, setTo] = useState(today);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let active = true;
    async function load() {
      setLoading(true); setError("");
      try {
        const headers = { Accept: "application/json", Authorization: `Bearer ${token}` };
        const [bookingResponse, packageResponse] = await Promise.all([
          fetch(`${API_URL}/api/package-bookings`, { headers, cache: "no-store" }),
          fetch(`${API_URL}/api/organizer/packages`, { headers, cache: "no-store" }),
        ]);
        const [bookingData, packageData] = await Promise.all([bookingResponse.json() as Promise<ApiResponse>, packageResponse.json() as Promise<ApiResponse>]);
        if (!bookingResponse.ok) throw new Error(bookingData.message || "Unable to load booking report.");
        if (!packageResponse.ok) throw new Error(packageData.message || "Unable to load packages.");
        if (active) { setBookings(bookingData.bookings || []); setPackages(packageData.packages || []); }
      } catch (caught) { if (active) setError(caught instanceof Error ? caught.message : "Unable to load report."); }
      finally { if (active) setLoading(false); }
    }
    void load(); return () => { active = false; };
  }, [token]);

  const filtered = useMemo(() => bookings.filter((booking) => booking.hiking_date.slice(0, 10) >= from && booking.hiking_date.slice(0, 10) <= to), [bookings, from, to]);
  const stats = useMemo(() => {
    const result = { total: filtered.length, awaitingOrganizer: 0, awaitingDenr: 0, confirmed: 0, rejected: 0, cancelled: 0, completed: 0, visitors: 0, confirmedVisitors: 0 };
    filtered.forEach((booking) => {
      const status = statusOf(booking);
      result.visitors += Number(booking.tourist_count || 0);
      if (status === "Awaiting Organizer") result.awaitingOrganizer += 1;
      if (status === "Awaiting DENR") result.awaitingDenr += 1;
      if (status === "Confirmed") { result.confirmed += 1; result.confirmedVisitors += Number(booking.tourist_count || 0); }
      if (status === "Rejected") result.rejected += 1;
      if (status === "Cancelled") result.cancelled += 1;
      if (status === "Completed") { result.completed += 1; result.confirmedVisitors += Number(booking.tourist_count || 0); }
    });
    return result;
  }, [filtered]);

  const packageBreakdown = useMemo(() => packages.map((item) => ({ name: item.name, count: filtered.filter((booking) => booking.package?.id === item.id).length, visitors: filtered.filter((booking) => booking.package?.id === item.id).reduce((sum, booking) => sum + Number(booking.tourist_count || 0), 0) })).sort((a, b) => b.count - a.count), [filtered, packages]);

  function downloadCsv() {
    const headers = ["Booking Number", "Package", "Customer", "Hike Date", "Trail", "Tourists", "Organizer Status", "DENR Status"];
    const rows = filtered.map((booking) => [booking.booking_number, booking.package?.name || "", `${booking.customer?.first_name || ""} ${booking.customer?.last_name || ""}`.trim(), booking.hiking_date.slice(0, 10), booking.trail?.name || "", String(booking.tourist_count), booking.status, booking.denr_status || ""]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `epulag-organizer-bookings-${from}-to-${to}.csv`; anchor.click(); URL.revokeObjectURL(url);
  }

  const cards = [
    ["Total Bookings", stats.total], ["Awaiting Organizer", stats.awaitingOrganizer], ["Awaiting DENR", stats.awaitingDenr], ["Confirmed", stats.confirmed], ["Rejected", stats.rejected], ["Cancelled", stats.cancelled], ["Tourists in Bookings", stats.visitors], ["Confirmed / Completed Visitors", stats.confirmedVisitors],
  ] as const;

  return <div className="space-y-5">
    <Card className="p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="flex items-center gap-3"><FileBarChart2 className="h-6 w-6 text-emerald-600" /><div><h2 className="font-semibold text-zinc-900 dark:text-white">Booking report</h2><p className="text-xs text-zinc-500 dark:text-zinc-400">Based on package booking records and their approval status.</p></div></div><div className="flex flex-wrap items-end gap-3"><label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">From<input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="mt-1 block rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" /></label><label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">To<input type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} className="mt-1 block rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" /></label><Button type="button" onClick={downloadCsv} disabled={loading || filtered.length === 0}><Download className="mr-2 h-4 w-4" />Export CSV</Button></div></div></Card>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <Card key={label} className="p-5"><p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p><p className="mt-2 text-3xl font-bold tabular-nums text-zinc-900 dark:text-white">{loading && token ? "—" : value.toLocaleString()}</p></Card>)}</div>
    <Card className="p-5 sm:p-6"><div className="mb-5 flex items-center gap-2"><Users className="h-5 w-5 text-emerald-600" /><h2 className="font-semibold text-zinc-900 dark:text-white">Package performance</h2></div>{packageBreakdown.length === 0 ? <p className="py-8 text-center text-sm text-zinc-500">No package bookings in this date range.</p> : <div className="space-y-4">{packageBreakdown.map((item) => <div key={item.name}><div className="mb-1 flex items-center justify-between gap-3"><span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{item.name}</span><span className="text-xs tabular-nums text-zinc-500">{item.count} bookings · {item.visitors} tourists</span></div><div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.max(0, ...packageBreakdown.map((entry) => entry.count)) ? item.count / Math.max(...packageBreakdown.map((entry) => entry.count)) * 100 : 0}%` }} /></div></div>)}</div>}</Card>
    <p className="text-xs text-zinc-400">Visitor totals are booking counts, not confirmed attendance. Payment totals are not shown because payments are handled manually by DENR.</p>
  </div>;
}
