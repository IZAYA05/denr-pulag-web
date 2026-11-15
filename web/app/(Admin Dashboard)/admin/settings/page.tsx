import BookingSettings from "@/components/admin/settings/BookingSettings";
import GeneralSettings from "@/components/admin/settings/GeneralSettings";
import NotificationSettings from "@/components/admin/settings/NotificationSettings";
import TrailSettings from "@/components/admin/settings/TrailSettings";


export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">System Information</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Review the current E-PULAG policies and configuration. Operational settings shown here are read-only.</p>
      </div>

      <GeneralSettings />

      <div className="grid gap-8 xl:grid-cols-2">
        <BookingSettings />
        <TrailSettings />
      </div>

      <NotificationSettings />

    </div>
  );
}