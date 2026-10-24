
import PageHeader from "@/components/ui/PageHeader";

import {
  BookingProvider,
} from "@/components/organizer/bookings/BookingContext";
import BookingStats from "@/components/organizer/bookings/BookingStats";
import BookingFilters from "@/components/organizer/bookings/BookingFilters";
import BookingTable from "@/components/organizer/bookings/BookingTable";
import BookingPagination from "@/components/organizer/bookings/BookingPagination";

export default function OrganizerBookingsPage() {
  return (
    <BookingProvider>
      <div className="space-y-8">
        <PageHeader
          title="Package Bookings"
          description="Manage tourist bookings made through your packages."
        />

        <BookingStats />

        <BookingFilters />

        <BookingTable />

        <BookingPagination />
      </div>
    </BookingProvider>
  );
}
