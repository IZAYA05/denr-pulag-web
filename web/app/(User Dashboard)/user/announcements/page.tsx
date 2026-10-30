"use client";

import AnnouncementsHero from "@/components/user/announcements/AnnouncementsHero";
import AnnouncementsSection from "@/components/user/announcements/AnnouncementsSection";

export default function AnnouncementsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <AnnouncementsHero />
      <AnnouncementsSection />
    </div>
  );
}