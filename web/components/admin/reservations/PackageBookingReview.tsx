"use client";

import { useCallback, useEffect, useState } from "react";

import { useDashboard } from "@/components/admin/DashboardClient";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";

type BookingStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

type DenrStatus = "PENDING" | "APPROVED" | "REJECTED" | null;

type Person = {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
};

type PackageBooking = {
  id: number;
  booking_number: string;
  hiking_date: string;
  tourist_count: number;
  status: BookingStatus;
  denr_status: DenrStatus;
  remarks?: string | null;

  package?: {
    id?: number;
    name?: string;
    organizer?: Person | null;
  } | null;

  customer?: Person | null;

  trail?: {
    id?: number;
    name?: string;
  } | null;

  tourists?: {
    id: number;
    full_name: string;
  }[];
};

type ApiResponse = {
  bookings?: PackageBooking[];
  message?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

export default function PackageBookingReview() {
  const { accessToken } = useDashboard();

  const [bookings, setBookings] = useState<PackageBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/package-bookings`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch package bookings."
        );
      }

      setBookings(
        Array.isArray(data.bookings) ? data.bookings : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load package bookings."
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleDenrDecision = async (
    booking: PackageBooking,
    decision: "APPROVED" | "REJECTED"
  ) => {
    if (!accessToken || processingId !== null) {
      return;
    }

    const action = decision === "APPROVED" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} booking ${booking.booking_number}?`
    );

    if (!confirmed) {
      return;
    }

    setProcessingId(booking.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/package-bookings/${booking.id}/denr-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            denr_status: decision,
          }),
        }
      );

      const data = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update DENR booking status."
        );
      }

      setBookings((currentBookings) =>
        currentBookings.map((item) =>
          item.id === booking.id
            ? {
                ...item,
                denr_status: decision,
              }
            : item
        )
      );

      setSuccess(
        data.message || `Booking ${booking.booking_number} ${action}d successfully.`
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to process package booking."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "Not specified";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatStatus = (status: string | null) => {
    if (!status) return "Not started";

    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const getStatusVariant = (
    status: string
  ): "success" | "warning" | "danger" => {
    switch (status) {
      case "APPROVED":
        return "success";

      case "REJECTED":
      case "CANCELLED":
        return "danger";

      default:
        return "warning";
    }
  };

  const getPersonName = (person?: Person | null) => {
    if (!person) return "Unknown";

    const name = [
      person.first_name,
      person.last_name,
    ].filter(Boolean).join(" ");

    return name || person.email || "Unknown";
  };

  const awaitingDenr = bookings.filter(
    (booking) =>
      booking.status === "APPROVED" &&
      booking.denr_status === "PENDING"
  ).length;

  const denrApproved = bookings.filter(
    (booking) => booking.denr_status === "APPROVED"
  ).length;

  const denrRejected = bookings.filter(
    (booking) => booking.denr_status === "REJECTED"
  ).length;

  return (
    <Card className="bg-white/90 p-6 backdrop-blur-xl dark:bg-zinc-950/90">
      {/* Header */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Package Booking Review
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Review Organizer-approved bookings and make the final DENR decision.
          </p>
        </div>

        <Button
          onClick={fetchBookings}
          disabled={loading}
          className="px-4 py-2"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Summary */}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Awaiting DENR
          </p>

          <p className="mt-1 text-2xl font-bold text-amber-800 dark:text-amber-300">
            {awaitingDenr}
          </p>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/20">
          <p className="text-sm text-green-700 dark:text-green-400">
            DENR Approved
          </p>

          <p className="mt-1 text-2xl font-bold text-green-800 dark:text-green-300">
            {denrApproved}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
          <p className="text-sm text-red-700 dark:text-red-400">
            DENR Rejected
          </p>

          <p className="mt-1 text-2xl font-bold text-red-800 dark:text-red-300">
            {denrRejected}
          </p>
        </div>
      </div>

      {/* Success */}

      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
          {success}
        </div>
      )}

      {/* Error */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}

      {loading && (
        <div className="py-10 text-center text-sm text-zinc-500">
          Loading package bookings...
        </div>
      )}

      {/* Table */}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <Table className="min-w-[1200px] border-0 bg-transparent shadow-none">
            <thead className="border-b border-zinc-200 dark:border-zinc-800">
              <tr className="text-left">
                <th className="px-4 py-4 text-sm font-semibold text-zinc-500">
                  Booking
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-zinc-500">
                  Tourist / Customer
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-zinc-500">
                  Package / Organizer
                </th>

                <th className="px-4 py-4 text-sm font-semibold text-zinc-500">
                  Trail / Hiking Date
                </th>

                <th className="px-4 py-4 text-center text-sm font-semibold text-zinc-500">
                  Tourists
                </th>

                <th className="px-4 py-4 text-center text-sm font-semibold text-zinc-500">
                  Organizer
                </th>

                <th className="px-4 py-4 text-center text-sm font-semibold text-zinc-500">
                  DENR
                </th>

                <th className="px-4 py-4 text-right text-sm font-semibold text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-zinc-500"
                  >
                    No package bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const canProcess =
                    booking.status === "APPROVED" &&
                    booking.denr_status === "PENDING";

                  const isProcessing = processingId === booking.id;

                  return (
                    <tr
                      key={booking.id}
                      className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/40"
                    >
                      <td className="px-4 py-5">
                        <p className="font-semibold text-zinc-900 dark:text-white">
                          {booking.booking_number}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          ID: {booking.id}
                        </p>
                      </td>

                      <td className="px-4 py-5">
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">
                          {getPersonName(booking.customer)}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {booking.customer?.email || "No email"}
                        </p>
                      </td>

                      <td className="px-4 py-5">
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">
                          {booking.package?.name || "Unknown Package"}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          Organizer:{" "}
                          {getPersonName(booking.package?.organizer)}
                        </p>
                      </td>

                      <td className="px-4 py-5">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">
                          {booking.trail?.name || "Unknown Trail"}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {formatDate(booking.hiking_date)}
                        </p>
                      </td>

                      <td className="px-4 py-5 text-center text-sm text-zinc-700 dark:text-zinc-300">
                        {booking.tourist_count}
                      </td>

                      <td className="px-4 py-5 text-center">
                        <Badge
                          variant={getStatusVariant(booking.status)}
                        >
                          {formatStatus(booking.status)}
                        </Badge>
                      </td>

                      <td className="px-4 py-5 text-center">
                        {booking.denr_status ? (
                          <Badge
                            variant={getStatusVariant(booking.denr_status)}
                          >
                            {formatStatus(booking.denr_status)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-zinc-500">
                            Not started
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-5">
                        {canProcess ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() =>
                                handleDenrDecision(booking, "APPROVED")
                              }
                              disabled={processingId !== null}
                              className="bg-green-600 px-3 py-2 text-xs text-white hover:bg-green-700"
                            >
                              {isProcessing ? "Processing..." : "Approve"}
                            </Button>

                            <Button
                              onClick={() =>
                                handleDenrDecision(booking, "REJECTED")
                              }
                              disabled={processingId !== null}
                              className="bg-red-600 px-3 py-2 text-xs text-white hover:bg-red-700"
                            >
                              {isProcessing ? "Processing..." : "Reject"}
                            </Button>
                          </div>
                        ) : (
                          <p className="text-right text-xs text-zinc-400">
                            No action available
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* Footer */}

      {!loading && !error && (
        <div className="mt-4 border-t border-zinc-100 pt-4 text-xs text-zinc-500 dark:border-zinc-900">
          Showing {bookings.length} package booking records.
          Decisions apply to each booking record individually.
        </div>
      )}
    </Card>
  );
}
