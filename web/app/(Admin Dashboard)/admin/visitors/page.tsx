import VisitorStats from "@/components/admin/visitors/VisitorStats";
import VisitorFilters from "@/components/admin/visitors/VisitorFilters";
import VisitorTable from "@/components/admin/visitors/VisitorTable";

export default function VisitorsPage() {
  return (
    <div className="space-y-8">
      <VisitorStats />

      <VisitorFilters />

      <VisitorTable />
    </div>
  );
}