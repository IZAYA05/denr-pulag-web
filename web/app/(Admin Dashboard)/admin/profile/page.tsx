import ProfileHeader from "@/components/admin/profile/ProfileHeader";
import PersonalInformation from "@/components/admin/profile/PersonalInformation";
import AccountInformation from "@/components/admin/profile/AccountInformation";
import ChangePassword from "@/components/admin/profile/ChangePassword";
import RecentLoginActivity from "@/components/admin/profile/RecentLoginActivity";

import Button from "@/components/ui/Button";

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
          Save Changes
        </Button>
      </div>
    </div>
  );
}