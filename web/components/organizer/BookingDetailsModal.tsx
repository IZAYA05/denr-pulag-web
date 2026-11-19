"use client";

import { CheckCircle2, X } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

type BookingStatus =
  | "Pending"
  | "Awaiting DENR"
  | "Confirmed"
  | "Rejected"
  | "Cancelled"
  | "Completed";

type ApiBookingStatus =
  | "PENDING"
  | "APPROVED"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

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
  denr_status?: string | null;
  remarks: string | null;
  customer?: { id: number; first_name: string; last_name: string; email?: string; phone?: string } | null;
  tourists?: Array<{ id: number; full_name: string; age: number; gender: string; nationality: string; contact_number?: string | null; address?: string | null }>;
  package: ApiPackage;
  trail: ApiTrail;
}

interface BookingDetailsModalProps {
  booking: ApiPackageBooking;
  onClose: () => void;
}

export function formatBookingStatus(booking: ApiPackageBooking): BookingStatus {
  const organizerStatus = String(booking.status || "").toUpperCase();
  const denrStatus = String(booking.denr_status || "").toUpperCase();

  if (organizerStatus === "REJECTED" || denrStatus === "REJECTED") return "Rejected";
  if (organizerStatus === "CANCELLED") return "Cancelled";
  if (organizerStatus === "COMPLETED") return "Completed";
  if (organizerStatus === "PENDING") return "Pending";
  if (organizerStatus === "APPROVED" && denrStatus === "PENDING") return "Awaiting DENR";
  if (organizerStatus === "APPROVED" && denrStatus === "APPROVED") return "Confirmed";

  return "Pending";
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
    timeZone: "UTC",
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
      return "success" as const;

    case "Pending":
    case "Awaiting DENR":
      return "warning" as const;

    case "Completed":
      return "info" as const;

    case "Cancelled":
    case "Rejected":
      return "danger" as const;

    default:
      return "secondary" as const;
  }
}

export default function BookingDetailsModal({
  booking,
  onClose,
}: BookingDetailsModalProps) {
  const packageCapacity = Number(
    booking.package?.max_tourists ?? 12
  );

  const bookingStatus = formatBookingStatus(booking);

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
                Booking Customer
              </p>
              <p className="mt-2 font-semibold text-zinc-900 dark:text-white">
                {[booking.customer?.first_name, booking.customer?.last_name].filter(Boolean).join(" ") || "Customer details unavailable"}
              </p>
              {booking.customer?.email && <p className="mt-1 break-all text-xs text-zinc-500">{booking.customer.email}</p>}
              {booking.customer?.phone && <p className="mt-1 text-xs text-zinc-500">{booking.customer.phone}</p>}
            </div>

            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Booking Status
              </p>

              <div className="mt-2">
                <Badge
                  variant={getBookingStatusVariant(bookingStatus)}
                >
                  {bookingStatus}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Tourist Participants
            </h3>
            <div className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {booking.tourists && booking.tourists.length > 0 ? booking.tourists.map((tourist, index) => (
                <div key={tourist.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{index + 1}. {tourist.full_name}</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{tourist.age} years · {tourist.gender} · {tourist.nationality}</p>
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-right">
                    {tourist.contact_number || "No contact number"}
                    {tourist.address && <p className="mt-1 max-w-xs">{tourist.address}</p>}
                  </div>
                </div>
              )) : <p className="px-4 py-4 text-sm text-zinc-500 dark:text-zinc-400">Participant details are not available for this booking.</p>}
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
