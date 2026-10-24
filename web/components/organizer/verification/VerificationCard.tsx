import { ClipboardList, Eye, CheckCircle2 } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

import {
  formatHikeDate,
  getStatusVariant,
  type VerificationItem,
} from "./types";

interface VerificationCardProps {
  item: VerificationItem;
  updating: boolean;
  onView: (item: VerificationItem) => void;
  onVerify: () => void;
}

export default function VerificationCard({
  item,
  updating,
  onView,
  onVerify,
}: VerificationCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
            <ClipboardList className="h-6 w-6 text-emerald-600" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-semibold text-zinc-900 dark:text-white">
                {item.packageName}
              </h2>

              <Badge variant={getStatusVariant(item.status)}>
                {item.status}
              </Badge>
            </div>

            <p className="mt-1 break-words text-sm text-zinc-500 dark:text-zinc-400">
              Booking Number:{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {item.bookingId}
              </span>
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <p className="text-xs text-zinc-400">Tourists</p>
                <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {item.tourists}/{item.capacity}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-400">Hike Date</p>
                <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {formatHikeDate(item.hikeDate)}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-400">Verification Status</p>
                <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {item.status}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 xl:ml-6">
          <Button variant="outline" onClick={() => onView(item)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>

          {item.status !== "Verified" && (
            <Button onClick={onVerify} disabled={updating}>
              {updating ? (
                "Verifying..."
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verify Booking
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Remarks:
          </span>{" "}
          {item.notes}
        </p>
      </div>
    </Card>
  );
}