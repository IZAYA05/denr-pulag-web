import { CheckCircle2 } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

import {
  formatHikeDate,
  getStatusVariant,
  type VerificationItem,
} from "./types";

interface VerificationDetailsModalProps {
  item: VerificationItem | null;
  updating: boolean;
  error: string;
  onClose: () => void;
  onVerify: () => void;
}

export default function VerificationDetailsModal({
  item,
  updating,
  error,
  onClose,
  onVerify,
}: VerificationDetailsModalProps) {
  return (
    <Modal
      open={Boolean(item)}
      onClose={onClose}
      title="Booking Verification Details"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={updating}>
            Close
          </Button>

          {item && item.status !== "Verified" && (
            <Button onClick={onVerify} disabled={updating}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {updating ? "Verifying..." : "Verify Booking"}
            </Button>
          )}
        </>
      }
    >
      {item && (
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Booking Number
              </p>
              <p className="mt-1 break-words font-semibold text-zinc-900 dark:text-white">
                {item.bookingId}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Package
              </p>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                {item.packageName}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Tourists
              </p>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                {item.tourists}/{item.capacity}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Hike Date
              </p>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                {formatHikeDate(item.hikeDate)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Verification Status
            </p>

            <div className="mt-2">
              <Badge variant={getStatusVariant(item.status)}>
                {item.status}
              </Badge>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Booking Remarks
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              {item.notes}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
            >
              {error}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}