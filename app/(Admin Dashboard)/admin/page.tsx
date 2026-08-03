import DashboardStats from "@/components/admin/DashboardStats";
import MonthlyChart from "@/components/admin/MonthlyChart";
import StatusChart from "@/components/admin/StatusChart";
import RecentReservations from "@/components/admin/RecentReservations";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Statistics */}

      <DashboardStats />

      Charts 

       <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
            <MonthlyChart />
        </div>

        <StatusChart />
        </section>

      Recent Reservations

      <RecentReservations />
    </div>
  );
}