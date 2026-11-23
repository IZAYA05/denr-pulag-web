import BookingCalendar from "@/components/admin/calendar/BookingCalendar";
import CalendarStats from "@/components/admin/calendar/CalendarStats";
import UpcomingEvents from "@/components/admin/calendar/UpcomingEvents";
import BlockedDateManager from "@/components/admin/calendar/BlockedDateManager";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <CalendarStats />

      <BookingCalendar />

      <section className="grid gap-6 xl:grid-cols-2">
        <BlockedDateManager />
        <UpcomingEvents />
      </section>
    </div>
  );
}