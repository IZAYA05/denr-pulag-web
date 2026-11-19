import PageHeader from "@/components/ui/PageHeader";
import OrganizerCalendar from "@/components/organizer/portal/OrganizerCalendar";

export default function OrganizerCalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Booking Calendar" description="View hiking dates for bookings made through your packages." />
      <OrganizerCalendar />
    </div>
  );
}
