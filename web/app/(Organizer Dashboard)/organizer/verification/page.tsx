import PageHeader from "@/components/ui/PageHeader";
import OrganizerVerification from "@/components/organizer/portal/OrganizerVerification";

export default function OrganizerVerificationPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Business Verification" />
      <OrganizerVerification />
    </div>
  );
}
