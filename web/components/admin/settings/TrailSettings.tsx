import Link from "next/link";
import { Mountain, Settings2 } from "lucide-react";

import Card from "@/components/ui/Card";

const trailFields = [
  {
    label: "Trail Name",
    description: "The registered name of the trail.",
  },
  {
    label: "Description",
    description: "Information describing the trail.",
  },
  {
    label: "Difficulty",
    description: "The recorded difficulty classification.",
  },
  {
    label: "Trail Image",
    description: "The image associated with the trail.",
  },
  {
    label: "Maximum Capacity",
    description: "The configured maximum capacity for the trail.",
  },
  {
    label: "Active Status",
    description: "Determines whether the trail is active or inactive.",
  },
];

export default function TrailSettings() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Trail Configuration
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Information about the trail properties managed by E-PULAG.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {trailFields.map((field) => (
          <div
            key={field.label}
            className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              {field.label}
            </p>

            <p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
              {field.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
        <div className="flex items-start gap-3">
          <Settings2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />

          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              Manage Trail Records
            </p>

            <p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
              Trail records and their active status are managed through
              the Trail Management section.
            </p>

            <Link
              href="/admin/trails"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              <Mountain className="h-4 w-4" />
              Open Trail Management
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
        Separate maintenance mode and maintenance reminder settings are
        not currently implemented.
      </p>
    </Card>
  );
}
