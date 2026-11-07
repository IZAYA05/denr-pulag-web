import { Bell } from "lucide-react";

import AnnouncementStats from "@/components/admin/announcements/AnnouncementStats";
import Card from "@/components/ui/Card";

export default function AnnouncementsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Announcements
        </h1>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage announcements for tourists and organizers.
        </p>
      </div>

      <AnnouncementStats />

      <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="rounded-2xl bg-zinc-100 p-4 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          <Bell className="h-8 w-8" />
        </div>

        <h2 className="mt-5 text-lg font-semibold text-zinc-900 dark:text-white">
          Announcement Management Not Yet Connected
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Announcement publishing and management are not yet connected to
          the backend. No demonstration announcements are displayed.
        </p>
      </Card>
    </div>
  );
}
