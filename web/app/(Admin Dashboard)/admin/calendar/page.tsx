import BookingCalendar from "@/components/admin/calendar/BookingCalendar";
import CalendarFilters from "@/components/admin/calendar/CalendarFilters";
import CalendarStats from "@/components/admin/calendar/CalendarStats";
import UpcomingEvents from "@/components/admin/calendar/UpcomingEvents";

export default function CalendarPage() {
  return (
    <div className="space-y-8">
      <CalendarStats />

      <CalendarFilters />

      <BookingCalendar />

      <UpcomingEvents />
    </div>
  );
}
