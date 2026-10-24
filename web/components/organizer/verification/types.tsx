import type { ApiPackageBooking } from "@/components/organizer/BookingDetailsModal";

export type VerificationStatus =
  | "Not Verified"
  | "Verification Pending"
  | "Verified";

export type VerificationItem = {
  id: number;
  bookingId: string;
  packageName: string;
  tourists: number;
  capacity: number;
  hikeDate: string;
  status: VerificationStatus;
  notes: string;
  booking: ApiPackageBooking;
};

export function mapBookingToVerification(
  booking: ApiPackageBooking
): VerificationItem {
  const statusMap: Record<
  ApiPackageBooking["coordination_status"],
  VerificationStatus
> = {
  NOT_COORDINATED: "Not Verified",
  PENDING: "Verification Pending",
  COORDINATED: "Verified",
};

const status = statusMap[booking.coordination_status];

  return {
    id: booking.id,
    bookingId: booking.booking_number,
    packageName: booking.package?.name ?? "Unknown Package",
    tourists: booking.tourist_count,
    capacity: Number(booking.package?.max_tourists ?? 12),
    hikeDate: booking.hiking_date,
    status,
    notes:
      booking.remarks?.trim() ||
      "No additional remarks provided for this booking.",
    booking,
  };
}

export function getStatusVariant(
  status: VerificationStatus
): "success" | "warning" | "secondary" {
  switch (status) {
    case "Verified":
      return "success";
    case "Verification Pending":
      return "warning";
    default:
      return "secondary";
  }
}

export function formatHikeDate(date: string): string {
  const parsedDate = new Date(`${date.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}