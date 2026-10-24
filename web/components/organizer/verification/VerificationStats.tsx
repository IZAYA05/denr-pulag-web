import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock3,
} from "lucide-react";

import Card from "@/components/ui/Card";
import { VerificationItem } from "./types";

interface VerificationStatsProps {
  items: VerificationItem[];
}

export default function VerificationStats({
  items,
}: VerificationStatsProps) {
  const stats = [
    {
      label: "Total Bookings",
      value: items.length,
      icon: ClipboardList,
      iconClass: "text-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Not Verified",
      value: items.filter((item) => item.status === "Not Verified").length,
      icon: Clock3,
      iconClass: "text-zinc-600 dark:text-zinc-300",
      iconBg: "bg-zinc-100 dark:bg-zinc-800",
    },
    {
      label: "Verification Pending",
      value: items.filter(
        (item) => item.status === "Verification Pending"
      ).length,
      icon: Calendar,
      iconClass: "text-amber-600",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Verified",
      value: items.filter((item) => item.status === "Verified").length,
      icon: CheckCircle2,
      iconClass: "text-emerald-600",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
  ];

  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {stat.label}
                </p>

                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                  {stat.value}
                </p>
              </div>

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${stat.iconBg}`}
              >
                <Icon className={`h-6 w-6 ${stat.iconClass}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
}