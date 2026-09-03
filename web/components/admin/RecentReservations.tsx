"use client";

import { useEffect, useState } from "react";

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
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

  trail?: {
    name: string;
  } | null;
};

export default function RecentReservations() {
  const { accessToken } = useDashboard();

  const [reservations, setReservations] = useState<
    Reservation[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReservations() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/admin/reservations`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch reservations."
          );
        }

        // Only show the 5 most recent reservations
        setReservations(data.reservations.slice(0, 5));
      } catch (error) {
        console.error(error);

        setError("Failed to load reservations.");
      } finally {
        setLoading(false);
      }
    }

    fetchReservations();
  }, [accessToken]);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatStatus(status: Reservation["status"]) {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  function getBadgeVariant(status: Reservation["status"]) {
    switch (status) {
      case "APPROVED":
        return "success";

      case "PENDING":
        return "warning";

      default:
        return "danger";
    }
  }

  return (
    <Card className="bg-white/90 p-6 backdrop-blur-xl dark:bg-zinc-950/90">
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Recent Reservations
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Latest booking activities
          </p>
        </div>

        <Button className="px-4 py-2">
          View All
        </Button>
      </div>

      {/* Loading */}

      {loading && (
        <div className="py-8 text-center text-sm text-zinc-500">
          Loading reservations...
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div className="py-8 text-center text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Table */}

      {!loading && !error && (
        <Table className="border-0 bg-transparent shadow-none">
          <thead className="border-b border-zinc-200 dark:border-zinc-800">
            <tr className="text-left">
              <th className="pb-4 text-sm font-semibold text-zinc-500">
                Reservation ID
              </th>

              <th className="pb-4 text-sm font-semibold text-zinc-500">
                Visitor
              </th>

              <th className="pb-4 text-sm font-semibold text-zinc-500">
                Trail
              </th>

              <th className="pb-4 text-sm font-semibold text-zinc-500">
                Date
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
                  No reservations found.
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
                      {reservation.reservation_number}
                    </span>
                  </td>

                  <td className="py-4 text-zinc-600 dark:text-zinc-300">
                    {reservation.group_leader_name}
                  </td>

                  <td className="py-4 text-zinc-600 dark:text-zinc-300">
                    {reservation.trail?.name || "Unknown Trail"}
                  </td>

                  <td className="py-4 text-zinc-600 dark:text-zinc-300">
                    {formatDate(reservation.hiking_date)}
                  </td>

                  <td className="py-4">
                    <Badge
                      variant={getBadgeVariant(
                        reservation.status
                      )}
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