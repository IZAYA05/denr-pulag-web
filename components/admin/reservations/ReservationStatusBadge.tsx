type ReservationStatusBadgeProps = {
  status: "Approved" | "Pending" | "Cancelled";
};

export default function ReservationStatusBadge({
  status,
}: ReservationStatusBadgeProps) {
  const styles = {
    Approved:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    Pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    Cancelled:
      "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold
        ${styles[status]}
      `}
    >
      {status}
    </span>
  );
}