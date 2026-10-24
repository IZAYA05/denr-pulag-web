"use client";

import { XCircle } from "lucide-react";

import Button from "@/components/ui/Button";

interface CancelBookingModalProps {
  bookingNumber: string;
  cancelling: boolean;
  error: string;
  onKeepBooking: () => void;
  onCancelBooking: () => void;
}

export default function CancelBookingModal({
  bookingNumber,
  cancelling,
  error,
  onKeepBooking,
  onCancelBooking,
}: CancelBookingModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!cancelling) {
          onKeepBooking();
        }
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Cancel Booking?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Are you sure you want to cancel booking{" "}
              <span className="font-semibold text-zinc-900 dark:text-white">
                {bookingNumber}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
              This action will mark the booking as cancelled.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            disabled={cancelling}
            onClick={onKeepBooking}
          >
            Keep Booking
          </Button>

          <Button
            disabled={cancelling}
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={onCancelBooking}
          >
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </div>
      </div>
    </div>
  );
}