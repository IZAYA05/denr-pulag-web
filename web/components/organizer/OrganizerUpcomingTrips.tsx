import { CalendarDays } from "lucide-react";

import OrganizerDashboardSection from "@/components/organizer/OrganizerDashboardSection";

export default function OrganizerUpcomingTrips() {
  return (
    <OrganizerDashboardSection
      title="Upcoming Trips"
      description="Package bookings scheduled for upcoming trips."
      icon={
        <CalendarDays className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700" />
      }
      emptyTitle="No upcoming trips"
      emptyDescription="Upcoming package bookings will appear here."
    />
  );
}