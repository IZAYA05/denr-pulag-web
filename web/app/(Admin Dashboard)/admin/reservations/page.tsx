import ReservationStats from "@/components/admin/reservations/ReservationStats";
import ReservationTable from "@/components/admin/reservations/ReservationTable";
import PackageBookingReview from "@/components/admin/reservations/PackageBookingReview";

export default function ReservationsPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Direct Reservations
          </h2>

        </div>

        <ReservationStats />

        <ReservationTable />
      </section>

      <section>
        <PackageBookingReview />
      </section>
    </div>
  );
}
