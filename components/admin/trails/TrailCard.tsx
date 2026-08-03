import {
  Clock3,
  MapPinned,
  Users,
  Mountain,
} from "lucide-react";

import TrailStatusBadge from "./TrailStatusBadge";
import TrailActions from "./TrailActions";

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
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
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

        <TrailActions />
      </div>

      {/* Status */}
      <div className="mt-5">
        <TrailStatusBadge status={trail.status} />
      </div>

      {/* Details */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300">
          <MapPinned className="h-5 w-5 text-zinc-400" />

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Distance
            </p>

            <p className="font-medium">{trail.distance}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300">
          <Clock3 className="h-5 w-5 text-zinc-400" />

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Duration
            </p>

            <p className="font-medium">{trail.duration}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300">
          <Users className="h-5 w-5 text-zinc-400" />

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Daily Capacity
            </p>

            <p className="font-medium">
              {trail.capacity} hikers/day
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}