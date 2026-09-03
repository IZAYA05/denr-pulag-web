"use client";

import {
  Clock3,
  Eye,
  MapPinned,
  Mountain,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Dropdown from "@/components/ui/Dropdown";

export type TrailStatus = "Open" | "Closed" | "Maintenance";

export interface Trail {
  id: string;
  name: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  distance: string;
  duration: string;
  capacity: number;
  status: TrailStatus;
}

type TrailCardProps = {
  trail: Trail;
};

export default function TrailCard({ trail }: TrailCardProps) {
  const difficultyColors = {
    Easy: "text-emerald-600 dark:text-emerald-400",
    Moderate: "text-amber-600 dark:text-amber-400",
    Hard: "text-red-600 dark:text-red-400",
  };

  return (
    <Card className="p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
      {/* Header */}

      <div className="flex items-start justify-between">
        <div>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Mountain className="h-7 w-7" />
          </div>

          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            {trail.name}
          </h3>

          <p
            className={`mt-1 text-sm font-semibold ${difficultyColors[trail.difficulty]}`}
          >
            {trail.difficulty}
          </p>
        </div>

        {/* Actions */}

        <Dropdown>
          <Button
            variant="ghost"
            className="flex w-full justify-start gap-2 rounded-none"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>

          <Button
            variant="ghost"
            className="flex w-full justify-start gap-2 rounded-none"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>

          <Button
            variant="ghost"
            className="flex w-full justify-start gap-2 rounded-none text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-4 w-4" />
            Delete Trail
          </Button>
        </Dropdown>
      </div>

      {/* Status */}

      <div className="mt-5">
        <Badge
          variant={
            trail.status === "Open"
              ? "success"
              : trail.status === "Maintenance"
              ? "warning"
              : "danger"
          }
        >
          {trail.status}
        </Badge>
      </div>

      {/* Details */}

      <div className="mt-6 space-y-4">
        {/* Distance */}

        <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300">
          <MapPinned className="h-5 w-5 text-zinc-400" />

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Distance
            </p>

            <p className="font-medium">{trail.distance}</p>
          </div>
        </div>

        {/* Duration */}

        <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300">
          <Clock3 className="h-5 w-5 text-zinc-400" />

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Duration
            </p>

            <p className="font-medium">{trail.duration}</p>
          </div>
        </div>

        {/* Capacity */}

        <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300">
          <Users className="h-5 w-5 text-zinc-400" />

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Daily Capacity
            </p>

            <p className="font-medium">{trail.capacity} hikers/day</p>
          </div>
        </div>
      </div>
    </Card>
  );
}