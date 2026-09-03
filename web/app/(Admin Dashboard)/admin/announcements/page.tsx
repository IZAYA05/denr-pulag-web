"use client";

import { useState } from "react";

import AnnouncementCard from "@/components/admin/announcements/AnnouncementCard";
import AnnouncementFilters from "@/components/admin/announcements/AnnouncementFilters";
import AnnouncementModal from "@/components/admin/announcements/AnnouncementModal";
import AnnouncementStats from "@/components/admin/announcements/AnnouncementStats";

const announcements = [
  {
    id: 1,
    title: "Trail Maintenance Notice",
    description:
      "The Ambangeg Trail will be temporarily closed on August 15, 2026 due to scheduled maintenance.",
    status: "Published" as const,
    date: "August 1, 2026",
  },
  {
    id: 2,
    title: "Weather Advisory",
    description:
      "Heavy rainfall is expected this weekend. Visitors are advised to monitor weather updates before their hike.",
    status: "Draft" as const,
    date: "July 30, 2026",
  },
  {
    id: 3,
    title: "Holiday Schedule",
    description:
      "Reservations will be unavailable during the National Heroes Day holiday.",
    status: "Scheduled" as const,
    date: "August 20, 2026",
  },
];

export default function AnnouncementsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-8">
      <AnnouncementStats />

      <AnnouncementFilters
        onNewAnnouncement={() => setOpen(true)}
      />

      <div className="space-y-5">
        {announcements.map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            title={announcement.title}
            description={announcement.description}
            status={announcement.status}
            date={announcement.date}
          />
        ))}
      </div>

      <AnnouncementModal
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </div>
  );
}