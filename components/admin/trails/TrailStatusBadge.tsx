type TrailStatus = "Open" | "Closed" | "Maintenance";

type TrailStatusBadgeProps = {
  status: TrailStatus;
};

const styles = {
  Open: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  Closed: {
    badge:
      "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    dot: "bg-red-500",
  },
  Maintenance: {
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500",
  },
};

export default function TrailStatusBadge({
  status,
}: TrailStatusBadgeProps) {
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