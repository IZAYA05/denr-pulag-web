"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock,
  Search,
} from "lucide-react";

const reservations: {
  id: string;
  date: string;
  trail: string;
  participants: number;
  status: "Pending" | "Approved" | "Cancelled";
}[] = [];

export default function UserReservations() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.id.toLowerCase().includes(search.toLowerCase()) ||
      reservation.trail.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || reservation.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          My Reservations
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          View and track your Mount Pulag booking requests.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Total", value: reservations.length, icon: ClipboardList },
          {
            label: "Pending",
            value: reservations.filter((r) => r.status === "Pending").length,
            icon: Clock,
          },
          {
            label: "Approved",
            value: reservations.filter((r) => r.status === "Approved").length,
            icon: CalendarDays,
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {stat.label} Reservations
                </p>
                <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <Icon className="h-6 w-6 text-emerald-600" />
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white">
              Reservation History
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Search and filter your bookings.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search booking number..."
                className="w-full rounded-xl border border-zinc-200 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 sm:w-64 dark:border-zinc-700"
              />
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        {filteredReservations.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-600">
              <ClipboardList className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">
              No reservations found
            </h3>
            <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
              Your reservation history will appear here when you have bookings.
            </p>
            <Link
              href="/user"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600"
            >
              Return to Dashboard
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Booking No.</th>
                  <th className="px-4 py-3 font-medium">Hike Date</th>
                  <th className="px-4 py-3 font-medium">Trail</th>
                  <th className="px-4 py-3 font-medium">Participants</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="px-4 py-4 font-medium text-zinc-900 dark:text-white">
                      {reservation.id}
                    </td>
                    <td className="px-4 py-4">{reservation.date}</td>
                    <td className="px-4 py-4">{reservation.trail}</td>
                    <td className="px-4 py-4">{reservation.participants}</td>
                    <td className="px-4 py-4">{reservation.status}</td>
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
