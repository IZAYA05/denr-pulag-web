import ProfileHeader from "@/components/admin/profile/ProfileHeader";
import PersonalInformation from "@/components/admin/profile/PersonalInformation";
import AccountInformation from "@/components/admin/profile/AccountInformation";
import ChangePassword from "@/components/admin/profile/ChangePassword";
import RecentLoginActivity from "@/components/admin/profile/RecentLoginActivity";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <ProfileHeader />

      <div className="grid gap-6 xl:grid-cols-2">
        <PersonalInformation />
        <AccountInformation />
      </div>

      <ChangePassword />

      <RecentLoginActivity />

      <div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-3xl border border-zinc-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <button className="rounded-2xl border border-zinc-200 px-5 py-2.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          Cancel
        </button>

        <button className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700">
          Save Changes
        </button>
      </div>
    </div>
  );
}