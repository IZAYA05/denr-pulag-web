import EmployeeTrails from "@/components/employee/EmployeeTrails";
import BlockedDateManager from "@/components/admin/calendar/BlockedDateManager";

export default function EmployeeTrailsPage() {
  return (
    <div className="space-y-6">
      <EmployeeTrails />
      <BlockedDateManager />
    </div>
  );
}
