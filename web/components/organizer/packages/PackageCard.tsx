"use client";

import {
  Eye,
  Pencil,
  Power,
  Trash2,
  Users,
} from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

import type {
  OrganizerPackage,
  PackageStatus,
} from "./PackageContext";

type PackageCardProps = {
  packageItem: OrganizerPackage;
  togglingId: number | null;
  deletingId: number | null;
  onView: (packageItem: OrganizerPackage) => void;
  onEdit: (packageItem: OrganizerPackage) => void;
  onToggleStatus: (packageItem: OrganizerPackage) => Promise<void>;
  onDelete: (packageItem: OrganizerPackage) => void;
};

export default function PackageCard({
  packageItem,
  togglingId,
  deletingId,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: PackageCardProps) {
  const isToggling = togglingId === packageItem.id;
  const isDeleting = deletingId === packageItem.id;

  const status: PackageStatus = packageItem.status;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {packageItem.name}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {packageItem.description}
          </p>
        </div>

        <Badge
          variant={status === "Active" ? "success" : "secondary"}
        >
          {status}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Package Price
            </p>

            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              ₱
              {packageItem.price.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Users className="h-4 w-4" />

            <span>Max {packageItem.maxTourists}</span>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Included Services
          </p>

          {packageItem.services.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {packageItem.services.map((service, index) => (
                <span
                  key={`${service}-${index}`}
                  className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  {service}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              No services listed.
            </p>
          )}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-6 sm:grid-cols-4">
          <Button
            variant="secondary"
            onClick={() => onView(packageItem)}
          >
            <Eye className="mr-1.5 h-4 w-4" />
            View
          </Button>

          <Button
            variant="secondary"
            onClick={() => onEdit(packageItem)}
          >
            <Pencil className="mr-1.5 h-4 w-4" />
            Edit
          </Button>

          <Button
            variant="secondary"
            disabled={isToggling || isDeleting}
            onClick={() => void onToggleStatus(packageItem)}
          >
            <Power className="mr-1.5 h-4 w-4" />

            {isToggling
              ? "..."
              : status === "Active"
                ? "Off"
                : "On"}
          </Button>

          <Button
            variant="secondary"
            disabled={isDeleting || isToggling}
            onClick={() => onDelete(packageItem)}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />

            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </article>
  );
}