import {
  Mountain,
  Users,
  CalendarDays,
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
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

type TrailCardProps = {
  trail: Trail;
};

export default function TrailCard({ trail }: TrailCardProps) {
  const difficultyColors: Record<string, string> = {
    EASY: "text-emerald-600 dark:text-emerald-400",
    MODERATE: "text-amber-600 dark:text-amber-400",
    HARD: "text-red-600 dark:text-red-400",
  };

  const difficulty = trail.difficulty?.toUpperCase() || "UNSPECIFIED";

  return (
    <Card className="p-6 transition-shadow hover:shadow-lg">
      {/* Header */}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Mountain className="h-7 w-7" />
          </div>

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

        <Badge variant={trail.is_active ? "success" : "danger"}>
          {trail.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Description */}

      <div className="mt-5 min-h-16">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Description
        </p>

        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {trail.description || "No description provided."}
        </p>
      </div>

      {/* Database Details */}

      <div className="mt-6 space-y-4 border-t border-zinc-100 pt-5 dark:border-zinc-800">
        <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300">
          <Users className="h-5 w-5 text-zinc-400" />

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Maximum Capacity
            </p>

            <p className="font-medium">
              {trail.max_capacity.toLocaleString()} visitors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-300">
          <CalendarDays className="h-5 w-5 text-zinc-400" />

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Last Updated
            </p>

            <p className="font-medium">
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
      </div>
    </Card>
  );
}
