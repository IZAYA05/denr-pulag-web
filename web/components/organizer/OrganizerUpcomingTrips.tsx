"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CalendarDays, MapPin, Users } from "lucide-react";

import Card from "@/components/ui/Card";

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

type Booking = {
  id: number;
  booking_number: string;
  hiking_date: string;
  status: string;
  denr_status?: string | null;
  tourist_count?: number;
  tourists?: unknown[];
  package?: { name?: string } | null;
  trail?: { name?: string } | null;
};

type ApiResponse = { bookings?: Booking[]; message?: string };

function todayManila() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila" }).format(new Date(year, month - 1, day));
}

function getBookingStatus(booking: Booking) {
  const organizerStatus = (booking.status || "").toUpperCase();
  const denrStatus = (booking.denr_status || "").toUpperCase();
  if (organizerStatus === "PENDING") return "Awaiting Organizer";
  if (organizerStatus === "APPROVED" && denrStatus === "PENDING") return "Awaiting DENR";
  if (organizerStatus === "APPROVED" && denrStatus === "APPROVED") return "Confirmed";
  if (organizerStatus === "REJECTED" || denrStatus === "REJECTED") return "Rejected";
  if (organizerStatus === "CANCELLED") return "Cancelled";
  if (organizerStatus === "COMPLETED") return "Completed";
  return booking.status || "Pending";
}

export default function OrganizerUpcomingTrips() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    async function load() {
      try {
        const response = await fetch(`${API_URL}/api/package-bookings`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        });
        const data = (await response.json()) as ApiResponse;
        if (!response.ok) throw new Error(data.message || "Unable to load upcoming trips.");
        const today = todayManila();
        const upcoming = (data.bookings || [])
          .filter((item) => item.hiking_date?.slice(0, 10) >= today)
          .filter((item) => !["CANCELLED", "REJECTED"].includes((item.status || "").toUpperCase()))
          .filter((item) => (item.denr_status || "PENDING").toUpperCase() !== "REJECTED")
          .sort((a, b) => a.hiking_date.localeCompare(b.hiking_date))
          .slice(0, 6);
        if (active) setBookings(upcoming);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "Unable to load upcoming trips.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [accessToken]);

  return (
    <Card className="p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Upcoming Trips</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Package bookings scheduled for upcoming trips.</p>
      </div>
      {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
      {loading ? <p className="py-8 text-center text-sm text-zinc-500">Loading upcoming trips...</p> : bookings.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <CalendarDays className="h-9 w-9 text-zinc-300 dark:text-zinc-700" />
          <p className="mt-3 font-semibold text-zinc-800 dark:text-zinc-200">No upcoming trips</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Future package bookings will appear here after customers submit requests.</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {bookings.map((booking) => (
            <article key={booking.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">{booking.package?.name || "Package booking"}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{booking.booking_number || `Booking #${booking.id}`}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{formatDate(booking.hiking_date)}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{booking.trail?.name || "Trail unavailable"}</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{booking.tourist_count ?? booking.tourists?.length ?? 0} {(booking.tourist_count ?? booking.tourists?.length ?? 0) === 1 ? "visitor" : "visitors"}</span>
                </div>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                getBookingStatus(booking) === "Confirmed"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : getBookingStatus(booking) === "Rejected" || getBookingStatus(booking) === "Cancelled"
                    ? "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
              }`}>
                {getBookingStatus(booking)}
              </span>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
