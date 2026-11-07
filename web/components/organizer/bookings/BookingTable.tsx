"use client";

import {
  Eye,
  Pencil,
  XCircle,
  CheckCircle,
} from "lucide-react";

import {
  useBookings,
  type BookingDecisionStatus,
} from "./BookingContext";

import BookingDetailsModal from "@/components/organizer/BookingDetailsModal";
import CancelBookingModal from "@/components/organizer/CancelBookingModal";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Dropdown from "@/components/ui/Dropdown";
import Table from "@/components/ui/Table";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "secondary"
  | "info";

function getStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "Confirmed":
      return "success";

    case "Completed":
      return "info";

    case "Pending":
      return "warning";

    case "Rejected":
    case "Cancelled":
      return "danger";

    default:
      return "secondary";
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
    statusLoadingId,
    selectedBooking,
    bookingToCancel,
    setSelectedBooking,
    setBookingToCancel,
    setActionError,
    cancelBooking,
    updateStatus,
  } = useBookings();

  function getApiBooking(bookingNumber: string) {
    return apiBookings.find(
      (item) => item.booking_number === bookingNumber
    );
  }

  async function handleBookingDecision(
    bookingId: number,
    status: BookingDecisionStatus
  ) {
    const booking = apiBookings.find(
      (item) => item.id === bookingId
    );

    if (!booking) {
      setActionError("The selected booking could not be found.");
      return;
    }

    setActionError("");

    await updateStatus(booking, status);
  }

  return (
    <>
      <Card>
        <div className="flex flex-col gap-4 p-4">
          <div>
            <h2 className="text-lg font-semibold">Bookings</h2>

            <p className="text-sm text-gray-500">
              Review tourist bookings made through your packages and
              manage their booking status.
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
                <col style={{ width: "25%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>

              <thead>
                <tr>
                  <th className={headerClass}>Booking ID</th>
                  <th className={headerClass}>Package</th>
                  <th className={headerClass}>Hike Date</th>
                  <th className={headerClass}>Tourists</th>
                  <th className={headerClass}>Status</th>
                  <th className={`${headerClass} !text-center`}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center"
                    >
                      Loading bookings...
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
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

                    const isPending =
                      apiBooking?.status === "PENDING";

                    const isProcessing =
                      apiBooking !== undefined &&
                      statusLoadingId === apiBooking.id;

                    return (
                      <tr key={booking.id}>
                        <td
                          className={`${cellClass} whitespace-nowrap font-medium`}
                        >
                          {booking.id}
                        </td>

                        <td className={cellClass}>
                          <span className="block min-w-0 break-words">
                            {booking.packageName}
                          </span>
                        </td>

                        <td
                          className={`${cellClass} whitespace-nowrap`}
                        >
                          {booking.date}
                        </td>

                        <td
                          className={`${cellClass} whitespace-nowrap`}
                        >
                          {booking.tourists}/{capacity}
                        </td>

                        <td className={cellClass}>
                          <Badge variant={getStatusVariant(booking.status)}>
                            {booking.status}
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

                                {isPending && apiBooking && (
                                  <>
                                    <button
                                      type="button"
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-emerald-950"
                                      disabled={statusLoadingId !== null}
                                      onClick={() => {
                                        void handleBookingDecision(
                                          apiBooking.id,
                                          "APPROVED"
                                        );
                                      }}
                                    >
                                      <CheckCircle size={16} />

                                      {isProcessing
                                        ? "Processing..."
                                        : "Approve Booking"}
                                    </button>

                                    <button
                                      type="button"
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950"
                                      disabled={statusLoadingId !== null}
                                      onClick={() => {
                                        void handleBookingDecision(
                                          apiBooking.id,
                                          "REJECTED"
                                        );
                                      }}
                                    >
                                      <XCircle size={16} />

                                      {isProcessing
                                        ? "Processing..."
                                        : "Reject Booking"}
                                    </button>
                                  </>
                                )}

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
    </>
  );
}
