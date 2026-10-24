"use client";

import {
  Users,
} from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

import type { OrganizerPackage } from "./PackageContext";

type PackageViewModalProps = {
  open: boolean;
  packageItem: OrganizerPackage | null;
  onClose: () => void;
};

export default function PackageViewModal({
  open,
  packageItem,
  onClose,
}: PackageViewModalProps) {
  if (!packageItem) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Package Details"
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {packageItem.name}
            </h3>

            <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {packageItem.description}
            </p>
          </div>

          <Badge
            variant={
              packageItem.status === "Active"
                ? "success"
                : "secondary"
            }
          >
            {packageItem.status}
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Price per Tourist
            </p>

            <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              ₱
              {packageItem.price.toLocaleString(
                "en-PH",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Maximum Tourists
            </p>

            <div className="mt-1 flex items-center gap-2">
              <Users className="h-5 w-5 text-zinc-500" />

              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {packageItem.maxTourists}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Included Services
          </h4>

          {packageItem.services.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {packageItem.services.map(
                (service, index) => (
                  <span
                    key={`${service}-${index}`}
                    className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    {service}
                  </span>
                )
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              No services listed.
            </p>
          )}
        </div>

        <div className="flex justify-end border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}