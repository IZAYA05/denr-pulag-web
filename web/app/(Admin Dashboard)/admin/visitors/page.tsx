import VisitorStats from "@/components/admin/visitors/VisitorStats";
import VisitorTable from "@/components/admin/visitors/VisitorTable";

export default function VisitorsPage() {
  return (
    <div className="space-y-8">
      <VisitorStats />
      <VisitorTable />
    </div>
  );
}
