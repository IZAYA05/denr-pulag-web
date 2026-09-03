import BookingChart from "@/components/admin/reports/BookingChart";
import RecentActivity from "@/components/admin/reports/RecentActivity";
import ReportFilters from "@/components/admin/reports/ReportFilters";
import ReportStats from "@/components/admin/reports/ReportStats";
import StatusChart from "@/components/admin/reports/StatusChart";
import TrailPopularityChart from "@/components/admin/reports/TrailPopularityChart";

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <ReportStats />

      <ReportFilters />

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <BookingChart />
        </div>

        <StatusChart />
      </div>

      <TrailPopularityChart />

      <RecentActivity />
    </div>
  );
}