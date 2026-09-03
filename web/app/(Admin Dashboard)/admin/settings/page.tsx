import BookingSettings from "@/components/admin/settings/BookingSettings";
import GeneralSettings from "@/components/admin/settings/GeneralSettings";
import NotificationSettings from "@/components/admin/settings/NotificationSettings";
import TrailSettings from "@/components/admin/settings/TrailSettings";

import Button from "@/components/ui/Button";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <GeneralSettings />

      <div className="grid gap-8 xl:grid-cols-2">
        <BookingSettings />
        <TrailSettings />
      </div>

      <NotificationSettings />

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="primary"
        >
          Save All Changes
        </Button>
      </div>
    </div>
  );
}