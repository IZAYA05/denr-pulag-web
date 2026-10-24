
"use client";

import { useState } from "react";
import {
  Eye,
  Pencil,
  XCircle,
  ClipboardList,
} from "lucide-react";

import { useBookings } from "./BookingContext";
import BookingDetailsModal from "@/components/organizer/BookingDetailsModal";
import CancelBookingModal from "@/components/organizer/CancelBookingModal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Dropdown from "@/components/ui/Dropdown";
import Table from "@/components/ui/Table";

type ApiCoordinationStatus =
  | "NOT_COORDINATED"
  | "PENDING"
  | "COORDINATED";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "secondary"
  | "info";

function getStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "Confirmed":
    case "Verified":
    case "Coordinated":
      return "success";
    case "Completed":
      return "info";
    case "Pending":
    case "Verification Pending":
      return "warning";
    case "Cancelled":
      return "danger";
    default:
      return "secondary";
  }
}

function getVerificationLabel(status: string): string {
  switch (status) {
    case "NOT_COORDINATED":
    case "Not Coordinated":
      return "Not Verified";
    case "PENDING":
      return "Verification Pending";
    case "COORDINATED":
    case "Coordinated":
      return "Verified";
    default:
      return status;
  }
}

const headerClass =
  "!text-left whitespace-nowrap px-4 py-3 align-middle";

const cellClass =
  "px-4 py-3 text-left align-middle";

export default function BookingTable() {
  const {
    filteredBookings,
    apiBookings,
    loading,
    error,
    actionError,
    cancelling,
    coordinationLoadingId,
    selectedBooking,
    bookingToCancel,
    setSelectedBooking,
    setBookingToCancel,
    setActionError,
    cancelBooking,
    updateCoordination,
  } = useBookings();

  const [verificationBookingId, setVerificationBookingId] =
    useState<number | null>(null);

  const [selectedVerificationStatus, setSelectedVerificationStatus] =
    useState<ApiCoordinationStatus>("NOT_COORDINATED");

  function getApiBooking(bookingNumber: string) {
    return apiBookings.find(
      (item) => item.booking_number === bookingNumber
    );
  }

  function openVerification(
    bookingId: number,
    currentStatus: ApiCoordinationStatus
  ) {
    setVerificationBookingId(bookingId);
    setSelectedVerificationStatus(currentStatus);
    setActionError("");
  }

  async function saveVerification() {
    const booking = apiBookings.find(
      (item) => item.id === verificationBookingId
    );

    if (!booking) {
      setActionError("The selected booking could not be found.");
      return;
    }

    setActionError("");

    try {
      const saved = await updateCoordination(
        booking,
        selectedVerificationStatus
      );

      if (saved) {
        setVerificationBookingId(null);
      }
    } catch {
      setActionError(
        "Unable to update the booking verification status. Please try again."
      );
    }
  }

  return (
    <>
      <Card>
        <div className="flex flex-col gap-4 p-4">
          <div>
            <h2 className="text-lg font-semibold">Bookings</h2>
            <p className="text-sm text-gray-500">
              View bookings and manage booking verification.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {actionError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {actionError}
            </div>
          )}

          <div className="w-full overflow-x-auto">
            <Table>
              <colgroup>
                <col style={{ width: "15%" }} />
                <col style={{ width: "23%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "19%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>

              <thead>
                <tr>
                  <th className={headerClass}>Booking ID</th>
                  <th className={headerClass}>Package</th>
                  <th className={headerClass}>Hike Date</th>
                  <th className={headerClass}>Tourists</th>
                  <th className={headerClass}>Status</th>
                  <th className={headerClass}>Booking Verification</th>
                  <th className={`${headerClass} !text-center`}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      Loading bookings...
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const apiBooking = getApiBooking(booking.id);
                    const capacity = Number(
                      apiBooking?.package?.max_tourists ?? 12
                    );

                    return (
                      <tr key={booking.id}>
                        <td className={`${cellClass} whitespace-nowrap font-medium`}>
                          {booking.id}
                        </td>

                        <td className={cellClass}>
                          <span className="block min-w-0 break-words">
                            {booking.packageName}
                          </span>
                        </td>

                        <td className={`${cellClass} whitespace-nowrap`}>
                          {booking.date}
                        </td>

                        <td className={`${cellClass} whitespace-nowrap`}>
                          {booking.tourists}/{capacity}
                        </td>

                        <td className={cellClass}>
                          <Badge variant={getStatusVariant(booking.status)}>
                            {booking.status}
                          </Badge>
                        </td>

                        <td className={cellClass}>
                          <Badge
                            variant={getStatusVariant(
                              getVerificationLabel(booking.coordination)
                            )}
                          >
                            {getVerificationLabel(booking.coordination)}
                          </Badge>
                        </td>

                        <td className="px-4 py-3 text-center align-middle">
                          <div className="inline-flex">
                            <Dropdown>
                              <div className="flex flex-col py-1">
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                                  onClick={() => {
                                    if (apiBooking) {
                                      setSelectedBooking(apiBooking);
                                    }
                                  }}
                                  disabled={!apiBooking}
                                >
                                  <Eye size={16} />
                                  View Details
                                </button>

                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm opacity-50"
                                  disabled
                                  title="Booking editing is not implemented yet."
                                >
                                  <Pencil size={16} />
                                  Edit Booking
                                </button>

                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                                  disabled={
                                    !apiBooking ||
                                    coordinationLoadingId === apiBooking.id
                                  }
                                  onClick={() => {
                                    if (!apiBooking) return;

                                    openVerification(
                                      apiBooking.id,
                                      apiBooking.coordination_status
                                    );
                                  }}
                                >
                                  <ClipboardList size={16} />
                                  Verify Booking
                                </button>

                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  disabled={
                                    !apiBooking ||
                                    booking.status === "Cancelled" ||
                                    booking.status === "Completed"
                                  }
                                  onClick={() => {
                                    if (apiBooking) {
                                      setActionError("");
                                      setBookingToCancel(apiBooking);
                                    }
                                  }}
                                >
                                  <XCircle size={16} />
                                  Cancel Booking
                                </button>
                              </div>
                            </Dropdown>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </Card>

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {bookingToCancel && (
        <CancelBookingModal
          bookingNumber={bookingToCancel.booking_number}
          cancelling={cancelling}
          error={actionError}
          onKeepBooking={() => {
            if (!cancelling) {
              setBookingToCancel(null);
              setActionError("");
            }
          }}
          onCancelBooking={cancelBooking}
        />
      )}

      {verificationBookingId !== null && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              coordinationLoadingId === null
            ) {
              setVerificationBookingId(null);
              setActionError("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
          >
            <h2
              id="verification-title"
              className="text-lg font-semibold"
            >
              Booking Verification
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Update the verification status for this booking.
            </p>

            <div className="mt-5 space-y-3">
              {(
                [
                  {
                    value: "NOT_COORDINATED",
                    label: "Not Verified",
                  },
                  {
                    value: "PENDING",
                    label: "Verification Pending",
                  },
                  {
                    value: "COORDINATED",
                    label: "Verified",
                  },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 p-3 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  <input
                    type="radio"
                    name="verificationStatus"
                    value={option.value}
                    checked={
                      selectedVerificationStatus === option.value
                    }
                    onChange={() =>
                      setSelectedVerificationStatus(option.value)
                    }
                    disabled={coordinationLoadingId !== null}
                  />

                  <span className="text-sm font-medium">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setVerificationBookingId(null);
                  setActionError("");
                }}
                disabled={coordinationLoadingId !== null}
              >
                Cancel
              </Button>

              <Button
                onClick={saveVerification}
                disabled={coordinationLoadingId !== null}
              >
                {coordinationLoadingId !== null
                  ? "Saving..."
                  : "Save Status"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
