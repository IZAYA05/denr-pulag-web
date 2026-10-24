import UserDashboardStats from "./UserDashboardStats";
import UserUpcomingReservation from "./UserUpcomingReservation";
import UserReservationStatus from "./UserReservationStatus";
import UserRecentAnnouncements from "./UserRecentAnnouncements";

export default function UserDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Welcome back to E-PULAG.
        </p>
      </div>

      <UserDashboardStats />

      <div className="grid gap-6 xl:grid-cols-2">
        <UserUpcomingReservation />
        <UserReservationStatus />
      </div>

      <UserRecentAnnouncements />
    </div>
  );
}
