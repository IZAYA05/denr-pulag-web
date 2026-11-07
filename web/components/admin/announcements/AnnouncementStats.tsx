import { Bell } from "lucide-react";

import Card from "@/components/ui/Card";

export default function AnnouncementStats() {
  return (
    <Card className="flex items-start gap-4 p-6">
      <div className="rounded-2xl bg-amber-100 p-3 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
        <Bell className="h-6 w-6" />
      </div>

      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-white">
          Announcement Statistics Unavailable
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Statistics will be available once announcement records are connected
          to the database.
        </p>
      </div>
    </Card>
  );
}
