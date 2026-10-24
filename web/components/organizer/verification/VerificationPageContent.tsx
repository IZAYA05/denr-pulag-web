"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle, LoaderCircle, MessageSquare } from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import type { ApiPackageBooking } from "@/components/organizer/BookingDetailsModal";

import VerificationStats from "./VerificationStats";
import VerificationFilters from "./VerificationFilters";
import VerificationCard from "./VerificationCard";
import VerificationDetailsModal from "./VerificationDetailsModal";

import {
  mapBookingToVerification,
  type VerificationItem,
} from "./types";

type ApiResponse = {
  message?: string;
  bookings?: ApiPackageBooking[];
  booking?: ApiPackageBooking;
};

export default function VerificationPageContent() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;

  const apiUrl =
    process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:8000";

  const [items, setItems] = useState<VerificationItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [selectedItem, setSelectedItem] =
    useState<VerificationItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadBookings = useCallback(async () => {
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/api/package-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load package bookings.");
      }

      const bookings = Array.isArray(data.bookings) ? data.bookings : [];

      setItems(bookings.map(mapBookingToVerification));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading bookings."
      );
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (!token) {
      setItems([]);
      setError("You must be logged in to view booking verification.");
      setLoading(false);
      return;
    }

    void loadBookings();
  }, [sessionStatus, token, loadBookings]);

  const filteredItems = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.bookingId.toLowerCase().includes(searchValue) ||
        item.packageName.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All Statuses" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const updateVerification = useCallback(
    async (item: VerificationItem) => {
      if (!token) {
        setActionError("You must be logged in to update verification.");
        return;
      }

      setUpdatingId(item.id);
      setActionError("");
      setSuccessMessage("");

      try {
        const response = await fetch(
          `${apiUrl}/api/package-bookings/${item.id}/coordination`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            body: JSON.stringify({
              coordination_status: "COORDINATED",
            }),
          }
        );

        const data: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to verify this package booking."
          );
        }

        if (!data.booking) {
          throw new Error(
            "The server did not return the updated booking. Refresh and check its status."
          );
        }

        const updatedItem = mapBookingToVerification(data.booking);

        setItems((current) =>
          current.map((existing) =>
            existing.id === updatedItem.id ? updatedItem : existing
          )
        );

        setSelectedItem((current) =>
          current?.id === updatedItem.id ? updatedItem : current
        );

        setSuccessMessage(`${item.bookingId} has been verified.`);
      } catch (err) {
        setActionError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while verifying the booking."
        );
      } finally {
        setUpdatingId(null);
      }
    },
    [apiUrl, token]
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Booking Verification"
        description="Review package bookings and update their verification status."
        actions={
          <Button
            variant="outline"
            onClick={() => void loadBookings()}
            disabled={loading || sessionStatus === "loading" || !token}
          >
            Refresh Bookings
          </Button>
        }
      />

      <VerificationStats items={items} />

      <section className="rounded-3xl border border-blue-200 bg-blue-50/70 p-6 dark:border-blue-900/50 dark:bg-blue-950/20">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/40">
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>

          <div>
            <h2 className="font-semibold text-blue-900 dark:text-blue-300">
              Booking Verification
            </h2>

            <p className="mt-1 text-sm leading-6 text-blue-800 dark:text-blue-400">
              Verification currently uses the existing DENR coordination
              status. Marking a booking as verified updates its status in the
              backend.
            </p>
          </div>
        </div>
      </section>

      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          {successMessage}
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{actionError}</p>
        </div>
      )}

      <VerificationFilters
        search={search}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
      />

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading package bookings...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-900 dark:bg-red-950/30"
        >
          <AlertCircle className="mx-auto h-8 w-8 text-red-600 dark:text-red-400" />

          <p className="mt-3 font-medium text-red-800 dark:text-red-300">
            Unable to load bookings
          </p>

          <p className="mt-2 text-sm text-red-700 dark:text-red-400">
            {error}
          </p>

          <div className="mt-4">
            <Button onClick={() => void loadBookings()}>Try Again</Button>
          </div>
        </div>
      ) : (
        <section className="space-y-5">
          {filteredItems.map((item) => (
            <VerificationCard
              key={item.id}
              item={item}
              updating={updatingId === item.id}
              onView={setSelectedItem}
              onVerify={() => void updateVerification(item)}
            />
          ))}

          {filteredItems.length === 0 && (
            <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <MessageSquare className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700" />

              <p className="mt-4 font-medium text-zinc-700 dark:text-zinc-300">
                No verification records found
              </p>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Try changing your search or verification status filter.
              </p>
            </div>
          )}
        </section>
      )}

      <VerificationDetailsModal
        item={selectedItem}
        updating={selectedItem !== null && updatingId === selectedItem.id}
        error={actionError}
        onClose={() => {
          if (updatingId === null) {
            setSelectedItem(null);
            setActionError("");
          }
        }}
        onVerify={() => {
          if (selectedItem) {
            void updateVerification(selectedItem);
          }
        }}
      />
    </div>
  );
}
