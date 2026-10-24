import { Package } from "lucide-react";

import OrganizerDashboardSection from "@/components/organizer/OrganizerDashboardSection";

export default function OrganizerMyPackages() {
  return (
    <OrganizerDashboardSection
      title="My Packages"
      description="Packages you offer to tourists."
      icon={
        <Package className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700" />
      }
      emptyTitle="No packages yet"
      emptyDescription="Your packages will appear here once you create them."
    />
  );
}