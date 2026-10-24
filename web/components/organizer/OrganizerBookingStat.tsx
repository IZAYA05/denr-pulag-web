import { ReactNode } from "react";

interface OrganizerBookingStatProps {
  title: string;
  value: number;
  icon: ReactNode;
  iconClassName: string;
  iconBackgroundClassName: string;
}

export default function OrganizerBookingStat({
  title,
  value,
  icon,
  iconClassName,
  iconBackgroundClassName,
}: OrganizerBookingStatProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBackgroundClassName}`}
        >
          <span className={iconClassName}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
}