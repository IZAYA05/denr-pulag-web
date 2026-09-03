import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

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
  const statusVariants = {
    Published: "success",
    Draft: "warning",
    Scheduled: "info",
  } as const;

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {title}
            </h3>

            <Badge variant={statusVariants[status]}>
              {status}
            </Badge>
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
    </Card>
  );
}