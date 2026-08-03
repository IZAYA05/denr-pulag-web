import BookingSettings from "@/components/admin/settings/BookingSettings";
import GeneralSettings from "@/components/admin/settings/GeneralSettings";
import NotificationSettings from "@/components/admin/settings/NotificationSettings";
import TrailSettings from "@/components/admin/settings/TrailSettings";

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
        <button className="rounded-2xl border border-zinc-300 px-5 py-3 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          Cancel
        </button>

        <button className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700">
          Save All Changes
        </button>
      </div>
    </div>
  );
}