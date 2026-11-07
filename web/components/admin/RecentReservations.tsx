"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useDashboard } from "@/components/admin/DashboardClient";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";

type Reservation = {
  id: number;
  reservation_number: string;
  group_leader_name: string;
  hiking_date: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED";
  trail?: {
    name: string;
  } | null;
};

type ReservationsResponse = {
  reservations?: Reservation[];
  message?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

export default function RecentReservations() {
  const { accessToken } = useDashboard();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchReservations() {
      if (!accessToken) {
        setReservations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/admin/reservations`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data: ReservationsResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch reservations."
          );
        }

        const records = Array.isArray(data.reservations)
          ? data.reservations
          : [];

        setReservations(records.slice(0, 5));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load reservations."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchReservations();

    return () => controller.abort();
  }, [accessToken]);

  function formatDate(value: string) {
    if (!value) return "Not specified";

    const date = new Date(`${value.slice(0, 10)}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatStatus(status: Reservation["status"]) {
    return status
      .toLowerCase()
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function getBadgeVariant(status: Reservation["status"]) {
    switch (status) {
      case "APPROVED":
        return "success" as const;

      case "PENDING":
        return "warning" as const;

      case "REJECTED":
      case "CANCELLED":
        return "danger" as const;

      default:
        return "success" as const;
    }
  }

  return (
    <Card className="bg-white/90 p-6 backdrop-blur-xl dark:bg-zinc-950/90">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Recent Direct Reservations
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Latest direct reservation records.
          </p>
        </div>

        <Link href="/admin/reservations">
          <Button className="px-4 py-2">
            View All
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-zinc-500">
          Loading reservations...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="py-8 text-center text-sm text-red-500"
        >
          {error}
        </div>
      ) : (
        <Table className="border-0 bg-transparent shadow-none">
          <thead className="border-b border-zinc-200 dark:border-zinc-800">
            <tr className="text-left">
              <th className="pb-4 text-sm font-semibold text-zinc-500">
                Reservation ID
              </th>

              <th className="pb-4 text-sm font-semibold text-zinc-500">
                Group Leader
              </th>

              <th className="pb-4 text-sm font-semibold text-zinc-500">
                Trail
              </th>

              <th className="pb-4 text-sm font-semibold text-zinc-500">
                Hiking Date
              </th>

              <th className="pb-4 text-sm font-semibold text-zinc-500">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-sm text-zinc-500"
                >
                  No direct reservations found.
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => (
                <tr
                  key={reservation.id}
                  className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/40"
                >
                  <td className="py-4">
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {reservation.reservation_number ||
                        `Reservation #${reservation.id}`}
                    </span>
                  </td>

                  <td className="py-4 text-zinc-600 dark:text-zinc-300">
                    {reservation.group_leader_name || "Not specified"}
                  </td>

                  <td className="py-4 text-zinc-600 dark:text-zinc-300">
                    {reservation.trail?.name || "Not assigned"}
                  </td>

                  <td className="py-4 text-zinc-600 dark:text-zinc-300">
                    {formatDate(reservation.hiking_date)}
                  </td>

                  <td className="py-4">
                    <Badge
                      variant={getBadgeVariant(reservation.status)}
                    >
                      {formatStatus(reservation.status)}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
