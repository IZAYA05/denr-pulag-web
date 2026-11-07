import { ShieldCheck } from "lucide-react";

import Card from "@/components/ui/Card";
import type { ProfileUser } from "./ProfileContext";

type ProfileHeaderProps = {
  profile: ProfileUser;
};

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  EMPLOYEE: "Employee",
  ORGANIZER: "Organizer",
  USER: "User",
};

export default function ProfileHeader({
  profile,
}: ProfileHeaderProps) {
  const firstName = profile.first_name || "";
  const lastName = profile.last_name || "";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
    "EP";

  const fullName = `${firstName} ${lastName}`.trim();
  const roleLabel = roleLabels[profile.role] || profile.role;
  const isActive = profile.status?.toUpperCase() === "ACTIVE";

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100 text-4xl font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          {initials}
        </div>

        <h1 className="mt-5 text-2xl font-bold text-zinc-900 dark:text-white">
          {fullName || "E-PULAG User"}
        </h1>

        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          {roleLabel}
        </div>

        <p className="mt-3 text-zinc-500 dark:text-zinc-400">
          {profile.email}
        </p>

        <span
          className={`mt-3 rounded-full px-3 py-1 text-xs font-medium ${
            isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {profile.status || "Unknown"}
        </span>
      </div>
    </Card>
  );
}
