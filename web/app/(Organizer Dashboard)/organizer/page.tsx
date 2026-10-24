import OrganizerDashboardStats from "@/components/organizer/OrganizerDashboardStats";
import OrganizerUpcomingTrips from "@/components/organizer/OrganizerUpcomingTrips";
import OrganizerMyPackages from "@/components/organizer/OrganizerMyPackages";

import PageHeader from "@/components/ui/PageHeader";

export default function OrganizerDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Organizer Dashboard"
        description="Manage your packages, bookings, and upcoming trips."
      />

      {/* Statistics */}
      <OrganizerDashboardStats />

      {/* Upcoming Trips */}
      <OrganizerUpcomingTrips />

      {/* My Packages */}
      <OrganizerMyPackages />

    </div>
  );
}