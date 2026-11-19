"use client";

import {
  Mountain,
  Users,
  CalendarDays,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

export interface Trail {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  image: string | null;
  max_capacity: number;
  is_active: boolean | number | string;
  approved_reservations_count?: number;
  approved_package_bookings_count?: number;
  created_at?: string;
  updated_at?: string;
}

type TrailCardProps = {
  trail: Trail;
  onEdit: (trail: Trail) => void;
  onToggleStatus: (trail: Trail) => void;
  onDelete: (trail: Trail) => void;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

function isActive(value: Trail["is_active"]) {
  return value === true || value === 1 || value === "1";
}

export default function TrailCard({
  trail,
  onEdit,
  onToggleStatus,
  onDelete,
}: TrailCardProps) {
  const active = isActive(trail.is_active);
  const difficulty = trail.difficulty?.toUpperCase() || "UNSPECIFIED";

  const difficultyColors: Record<string, string> = {
    EASY: "text-emerald-600 dark:text-emerald-400",
    MODERATE: "text-amber-600 dark:text-amber-400",
    HARD: "text-red-600 dark:text-red-400",
    DIFFICULT: "text-red-600 dark:text-red-400",
  };

  const imageUrl = trail.image
    ? trail.image.startsWith("http")
      ? trail.image
      : `${API_URL}/storage/${trail.image.replace(/^\/+/, "")}`
    : null;

  const approvedBookings =
    Number(trail.approved_reservations_count ?? 0) +
    Number(trail.approved_package_bookings_count ?? 0);

  return (
    <Card className="overflow-hidden p-0 transition-shadow hover:shadow-lg">
      {imageUrl ? (
        <div className="h-40 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={trail.name}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
          <Mountain className="h-12 w-12" />
        </div>
      )}

      <div className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              {trail.name}
            </h3>

            <p
              className={`mt-1 text-sm font-semibold ${
                difficultyColors[difficulty] ||
                "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {trail.difficulty || "Not specified"}
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Trail ID: {trail.id}
            </p>
          </div>

          <Badge variant={active ? "success" : "danger"}>
            {active ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Description
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {trail.description || "No description provided."}
          </p>
        </div>

        <div className="space-y-4 border-t border-zinc-100 pt-5 dark:border-zinc-800">
          <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300">
            <Users className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Maximum Capacity
              </p>
              <p className="font-medium">
                {Number(trail.max_capacity).toLocaleString()} visitors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300">
            <CalendarDays className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Approved Bookings
              </p>
              <p className="font-medium">
                {approvedBookings.toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Last Updated
            </p>
            <p className="mt-1 font-medium text-zinc-700 dark:text-zinc-300">
              {trail.updated_at
                ? new Date(trail.updated_at).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Not available"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-zinc-100 pt-5 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => onEdit(trail)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Pencil size={16} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onToggleStatus(trail)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Power size={16} />
            {active ? "Deactivate" : "Activate"}
          </button>

          <button
            type="button"
            onClick={() => onDelete(trail)}
            className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <Trash2 size={16} />
            Delete Trail
          </button>
        </div>
      </div>
    </Card>
  );
}
