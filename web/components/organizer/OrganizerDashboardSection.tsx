import { ReactNode } from "react";

interface OrganizerDashboardSectionProps {
  title: string;
  description: string;
  icon: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
}

export default function OrganizerDashboardSection({
  title,
  description,
  icon,
  emptyTitle,
  emptyDescription,
}: OrganizerDashboardSectionProps) {
  return (
    <section
      className="
        rounded-3xl
        border border-zinc-200
        bg-white/90
        shadow-sm
        backdrop-blur-xl
        dark:border-zinc-800
        dark:bg-zinc-950/90
      "
    >
      <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {title}
        </h2>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>

      <div className="px-6 py-12 text-center">
        {icon}

        <p className="mt-4 font-medium text-zinc-700 dark:text-zinc-300">
          {emptyTitle}
        </p>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {emptyDescription}
        </p>
      </div>
    </section>
  );
}