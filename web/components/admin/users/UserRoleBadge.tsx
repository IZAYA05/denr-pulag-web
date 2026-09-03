import {
  ShieldCheck,
  ClipboardList,
  Trees,
} from "lucide-react";

export type UserRole =
  | "Administrator"
  | "Booking Officer"
  | "Park Ranger";

type UserRoleBadgeProps = {
  role: UserRole;
};

const styles = {
  Administrator: {
    badge:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
    icon: ShieldCheck,
  },
  "Booking Officer": {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    icon: ClipboardList,
  },
  "Park Ranger": {
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    icon: Trees,
  },
} as const;

export default function UserRoleBadge({
  role,
}: UserRoleBadgeProps) {
  const { badge, icon: Icon } = styles[role];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badge}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {role}
    </span>
  );
}