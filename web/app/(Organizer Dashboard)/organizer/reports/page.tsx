import PageHeader from "@/components/ui/PageHeader";
import OrganizerReports from "@/components/organizer/portal/OrganizerReports";

export default function OrganizerReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" />
      <OrganizerReports />
    </div>
  );
}
