import ReservationStats from "@/components/admin/reservations/ReservationStats";
import ReservationFilters from "@/components/admin/reservations/ReservationFilters";
import ReservationTable from "@/components/admin/reservations/ReservationTable";
import ReservationPagination from "@/components/admin/reservations/ReservationPagination";

export default function ReservationsPage() {
  return (
    <div className="space-y-8">
      <ReservationStats />

      <ReservationFilters />

      <ReservationTable />

      <ReservationPagination />
    </div>
  );
}