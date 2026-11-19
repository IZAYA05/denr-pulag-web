import PageHeader from "@/components/ui/PageHeader";
import OrganizerMessages from "@/components/organizer/portal/OrganizerMessages";

export default function OrganizerMessagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Messages" />
      <OrganizerMessages />
    </div>
  );
}
