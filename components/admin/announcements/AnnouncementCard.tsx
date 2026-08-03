import AnnouncementActions from "./AnnouncementActions";

type AnnouncementCardProps = {
  title: string;
  description: string;
  status: "Published" | "Draft" | "Scheduled";
  date: string;
};

export default function AnnouncementCard({
  title,
  description,
  status,
  date,
}: AnnouncementCardProps) {
  const statusClasses = {
    Published:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    Draft:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    Scheduled:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  };

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {title}
            </h3>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status]}`}
            >
              {status}
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {description}
          </p>

          <p className="mt-4 text-xs font-medium text-zinc-400">
            Published: {date}
          </p>
        </div>

        <AnnouncementActions />
      </div>
    </div>
  );
}