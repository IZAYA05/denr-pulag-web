"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock,
  Package,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

type DirectReservation = {
  id: number;
  reservation_number: string;
  hiking_date: string;
  status: string;
  total_participants?: number;
  participants?: unknown[];
  trail?: { name?: string } | null;
};

type PackageBooking = {
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

type ReservationRow = {
  key: string;
  bookingNumber: string;
  date: string;
  trail: string;
  packageName: string | null;
  participants: number;
  type: "Direct Reservation" | "Package Booking";
  status: string;
  statusTone: "amber" | "blue" | "green" | "red" | "gray";
};

type ApiResponse<T> = {
  reservations?: T[];
  bookings?: T[];
  message?: string;
};

function normalizeStatus(value?: string | null) {
  return (value || "").trim().toUpperCase();
}

function getDirectStatus(statusValue: string): Pick<ReservationRow, "status" | "statusTone"> {
  switch (normalizeStatus(statusValue)) {
    case "PENDING":
      return { status: "Awaiting DENR", statusTone: "amber" };
    case "APPROVED":
      return { status: "DENR Approved", statusTone: "green" };
    case "REJECTED":
      return { status: "Rejected", statusTone: "red" };
    case "CANCELLED":
      return { status: "Cancelled", statusTone: "gray" };
    case "COMPLETED":
      return { status: "Completed", statusTone: "blue" };
    default:
      return { status: statusValue || "Status unavailable", statusTone: "gray" };
  }
}

function getPackageStatus(
  organizerStatusValue: string,
  denrStatusValue?: string | null
): Pick<ReservationRow, "status" | "statusTone"> {
  const organizerStatus = normalizeStatus(organizerStatusValue);
  const denrStatus = normalizeStatus(denrStatusValue);

  if (organizerStatus === "PENDING") {
    return { status: "Awaiting Organizer", statusTone: "amber" };
  }
  if (organizerStatus === "REJECTED") {
    return { status: "Rejected by Organizer", statusTone: "red" };
  }
  if (organizerStatus === "CANCELLED") {
    return { status: "Cancelled", statusTone: "gray" };
  }
  if (organizerStatus === "COMPLETED") {
    return { status: "Completed", statusTone: "blue" };
  }
  if (organizerStatus === "APPROVED" && denrStatus === "PENDING") {
    return { status: "Awaiting DENR", statusTone: "amber" };
  }
  if (organizerStatus === "APPROVED" && denrStatus === "APPROVED") {
    return { status: "DENR Approved", statusTone: "green" };
  }
  if (denrStatus === "REJECTED") {
    return { status: "Rejected by DENR", statusTone: "red" };
  }

  return { status: "Status unavailable", statusTone: "gray" };
}

function formatDate(value: string) {
  const dateOnly = value?.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly || "")) return "Date unavailable";

  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(year, month - 1, day));
}

function statusClass(tone: ReservationRow["statusTone"]) {
  const classes = {
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300",
    green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
    red: "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-300",
    gray: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  };

  return classes[tone];
}

export default function UserReservations() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user?.accessToken;

  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReservations = useCallback(async () => {
    if (!accessToken) {
      setReservations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      const [directResponse, packageResponse] = await Promise.all([
        fetch(`${API_URL}/api/reservations`, { headers, cache: "no-store" }),
        fetch(`${API_URL}/api/package-bookings`, { headers, cache: "no-store" }),
      ]);

      const [directData, packageData] = await Promise.all([
        directResponse.json() as Promise<ApiResponse<DirectReservation>>,
        packageResponse.json() as Promise<ApiResponse<PackageBooking>>,
      ]);

      if (!directResponse.ok) {
        throw new Error(directData.message || "Unable to load direct reservations.");
      }
      if (!packageResponse.ok) {
        throw new Error(packageData.message || "Unable to load package bookings.");
      }

      const directRows: ReservationRow[] = (directData.reservations || []).map((item) => ({
        key: `direct-${item.id}`,
        bookingNumber: item.reservation_number || `Reservation #${item.id}`,
        date: item.hiking_date,
        trail: item.trail?.name || "Trail unavailable",
        packageName: null,
        participants: Number(item.total_participants ?? item.participants?.length ?? 0),
        type: "Direct Reservation",
        ...getDirectStatus(item.status),
      }));

      const packageRows: ReservationRow[] = (packageData.bookings || []).map((item) => ({
        key: `package-${item.id}`,
        bookingNumber: item.booking_number || `Package booking #${item.id}`,
        date: item.hiking_date,
        trail: item.trail?.name || "Trail unavailable",
        packageName: item.package?.name || null,
        participants: Number(item.tourist_count ?? item.tourists?.length ?? 0),
        type: "Package Booking",
        ...getPackageStatus(item.status, item.denr_status),
      }));

      setReservations(
        [...directRows, ...packageRows].sort((a, b) => b.date.localeCompare(a.date))
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load your reservation history."
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      void Promise.resolve().then(loadReservations);
    } else if (sessionStatus === "unauthenticated") {
      void Promise.resolve().then(() => {
        setReservations([]);
        setLoading(false);
      });
    }
  }, [loadReservations, sessionStatus]);

  const filteredReservations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return reservations.filter((reservation) => {
      const matchesSearch =
        !normalizedSearch ||
        reservation.bookingNumber.toLowerCase().includes(normalizedSearch) ||
        reservation.trail.toLowerCase().includes(normalizedSearch) ||
        (reservation.packageName || "").toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        filter === "All" ||
        (filter === "Pending" && reservation.status.startsWith("Awaiting")) ||
        (filter === "Approved" && reservation.status === "DENR Approved") ||
        (filter === "Rejected" && reservation.status.startsWith("Rejected")) ||
        (filter === "Cancelled" && reservation.status === "Cancelled");

      return matchesSearch && matchesFilter;
    });
  }, [reservations, search, filter]);

  const pendingCount = reservations.filter((item) => item.status.startsWith("Awaiting")).length;
  const approvedCount = reservations.filter((item) => item.status === "DENR Approved").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            My Reservations
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Track direct reservations and organizer package booking requests.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadReservations()}
          disabled={loading || !accessToken}
          className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Bookings", value: reservations.length, icon: ClipboardList },
          { label: "Awaiting Review", value: pendingCount, icon: Clock },
          { label: "DENR Approved", value: approvedCount, icon: CalendarDays },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
              </div>
              <Icon className="h-6 w-6 text-emerald-600" />
            </div>
          );
        })}
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white">Reservation History</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Search and filter your booking requests.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search booking, trail, or package..."
                className="w-full rounded-xl border border-zinc-200 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 sm:w-72 dark:border-zinc-700"
              />
            </div>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Awaiting review</option>
              <option value="Approved">DENR approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-56 items-center justify-center text-sm text-zinc-500">Loading your bookings...</div>
        ) : filteredReservations.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-600">
              <ClipboardList className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">
              {reservations.length === 0 ? "No bookings yet" : "No matching bookings"}
            </h3>
            <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
              {reservations.length === 0
                ? "When you submit a direct reservation or package booking request, its details and status will appear here."
                : "Try changing your search or status filter."}
            </p>
            {reservations.length === 0 && (
              <Link href="/user" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                Browse packages <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Booking No.</th>
                  <th className="px-4 py-3 font-medium">Hike Date</th>
                  <th className="px-4 py-3 font-medium">Trail / Package</th>
                  <th className="px-4 py-3 font-medium">Visitors</th>
                  <th className="px-4 py-3 font-medium">Booking Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.key}>
                    <td className="px-4 py-4 font-semibold text-zinc-900 dark:text-white">{reservation.bookingNumber}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{formatDate(reservation.date)}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-zinc-900 dark:text-white">{reservation.trail}</p>
                      {reservation.packageName && <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{reservation.packageName}</p>}
                    </td>
                    <td className="px-4 py-4"><span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-zinc-400" />{reservation.participants}</span></td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                        {reservation.type === "Package Booking" ? <Package className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
                        {reservation.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(reservation.statusTone)}`}>
                        {reservation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
