"use client";

import { CheckCircle2, X } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "Cancelled"
  | "Completed";

type CoordinationStatus =
  | "Not Coordinated"
  | "Pending"
  | "Coordinated";

type ApiBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type ApiCoordinationStatus =
  | "NOT_COORDINATED"
  | "PENDING"
  | "COORDINATED";

interface ApiPackageService {
  id: number;
  package_id: number;
  service: string;
}

interface ApiPackage {
  id: number;
  name: string;
  price: string;
  max_tourists: number;
  status: string;
  services?: ApiPackageService[];
}

interface ApiTrail {
  id: number;
  name: string;
}

export interface ApiPackageBooking {
  id: number;
  booking_number: string;
  package_id: number;
  customer_id: number;
  trail_id: number;
  hiking_date: string;
  tourist_count: number;
  status: ApiBookingStatus;
  coordination_status: ApiCoordinationStatus;
  remarks: string | null;
  package: ApiPackage;
  trail: ApiTrail;
}

interface BookingDetailsModalProps {
  booking: ApiPackageBooking;
  onClose: () => void;
}

function formatBookingStatus(
  status: ApiBookingStatus
): BookingStatus {
  switch (status) {
    case "CONFIRMED":
      return "Confirmed";

    case "CANCELLED":
      return "Cancelled";

    case "COMPLETED":
      return "Completed";

    case "PENDING":
    default:
      return "Pending";
  }
}

function formatCoordinationStatus(
  status: ApiCoordinationStatus
): CoordinationStatus {
  switch (status) {
    case "COORDINATED":
      return "Coordinated";

    case "PENDING":
      return "Pending";

    case "NOT_COORDINATED":
    default:
      return "Not Coordinated";
  }
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

function getBookingStatusVariant(status: BookingStatus) {
  switch (status) {
    case "Confirmed":
      return "success";

    case "Pending":
      return "warning";

    case "Completed":
      return "info";

    case "Cancelled":
      return "danger";

    default:
      return "secondary";
  }
}

function getCoordinationVariant(
  status: CoordinationStatus
) {
  switch (status) {
    case "Coordinated":
      return "success";

    case "Pending":
      return "warning";

    case "Not Coordinated":
      return "secondary";

    default:
      return "secondary";
  }
}

export default function BookingDetailsModal({
  booking,
  onClose,
}: BookingDetailsModalProps) {
  const packageCapacity = Number(
    booking.package?.max_tourists ?? 12
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Package Booking
            </p>

            <h2 className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">
              {booking.booking_number}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-white"
            aria-label="Close booking details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Package
              </p>

              <p className="mt-2 font-semibold text-zinc-900 dark:text-white">
                {booking.package?.name ?? "Unknown Package"}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Package Price
              </p>

              <p className="mt-2 font-semibold text-zinc-900 dark:text-white">
                {formatCurrency(
                  Number(booking.package?.price ?? 0)
                )}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Hike Date
              </p>

              <p className="mt-2 font-semibold text-zinc-900 dark:text-white">
                {formatDate(booking.hiking_date)}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Trail
              </p>

              <p className="mt-2 font-semibold text-zinc-900 dark:text-white">
                {booking.trail?.name ?? "Unknown Trail"}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Tourist Count
              </p>

              <p className="mt-2 font-semibold text-zinc-900 dark:text-white">
                {booking.tourist_count}/{packageCapacity}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Booking Status
              </p>

              <div className="mt-2">
                <Badge
                  variant={getBookingStatusVariant(
                    formatBookingStatus(booking.status)
                  )}
                >
                  {formatBookingStatus(booking.status)}
                </Badge>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                DENR Coordination
              </p>

              <div className="mt-2">
                <Badge
                  variant={getCoordinationVariant(
                    formatCoordinationStatus(
                      booking.coordination_status
                    )
                  )}
                >
                  {formatCoordinationStatus(
                    booking.coordination_status
                  )}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Package Services
            </h3>

            <div className="mt-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              {booking.package?.services &&
              booking.package.services.length > 0 ? (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {booking.package.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />

                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {service.service}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                  No services listed.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Remarks
            </h3>

            <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {booking.remarks || "No remarks provided."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}