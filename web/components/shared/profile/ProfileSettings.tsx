"use client";

import { ShieldCheck, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { useProfile, ProfileProvider } from "./ProfileContext";

import ProfileHeader from "./ProfileHeader";
import PersonalInformation from "./PersonalInformation";
import AccountInformation from "./AccountInformation";
import ChangePassword from "./ChangePassword";
import RecentLoginActivity from "./RecentLoginActivity";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

function EmployeeAccountActions() {
  return (
    <Card className="p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Account Actions
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your employee account session.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400" />

          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              Protected employee access
            </p>

            <p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
              Your dashboard is available according to your assigned account role.
            </p>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="danger"
        className="mt-5 w-full gap-2"
        onClick={() => void signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </Card>
  );
}

function ProfileSettingsContent({
  showEmployeeActions,
}: {
  showEmployeeActions: boolean;
}) {
  const { profile, loading, error, refreshProfile } = useProfile();

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading your profile settings...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Unable to load your profile
        </h2>

        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error || "Your profile information could not be retrieved."}
        </p>

        <div className="mt-5 flex justify-center">
          <Button
            type="button"
            onClick={() => void refreshProfile()}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileHeader profile={profile} />

      <div className="grid gap-6 xl:grid-cols-2">
        <PersonalInformation />
        <AccountInformation />
      </div>

      <ChangePassword />

      {/* Recent Login Activity: ADMIN and EMPLOYEE only */}
      {(profile.role === "ADMIN" || profile.role === "EMPLOYEE") && (
        <RecentLoginActivity />
      )}

      {/* Employee-specific account actions */}
      {showEmployeeActions && <EmployeeAccountActions />}
    </div>
  );
}

export default function ProfileSettings({
  showEmployeeActions = false,
}: {
  showEmployeeActions?: boolean;
}) {
  return (
    <ProfileProvider>
      <ProfileSettingsContent
        showEmployeeActions={showEmployeeActions}
      />
    </ProfileProvider>
  );
}
