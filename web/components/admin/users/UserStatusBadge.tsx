type UserStatus = "Active" | "Inactive";

type UserStatusBadgeProps = {
  status: UserStatus;
};

const styles = {
  Active: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  Inactive: {
    badge:
      "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    dot: "bg-red-500",
  },
};

export default function UserStatusBadge({
  status,
}: UserStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${styles[status].badge}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${styles[status].dot}`}
      />

      {status}
    </span>
  );
}