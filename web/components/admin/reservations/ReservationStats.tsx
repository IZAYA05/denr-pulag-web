import {
  CalendarCheck,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import StatCard from "@/components/ui/StatCard";

const stats = [
  {
    title: "Total Reservations",
    value: "264",
    subtitle: "All reservation records",
    icon: CalendarCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Pending",
    value: "52",
    subtitle: "Awaiting approval",
    icon: Clock3,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Approved",
    value: "185",
    subtitle: "Ready for visit",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Cancelled",
    value: "27",
    subtitle: "Cancelled reservations",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
];

export default function ReservationStats() {
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            iconColor={stat.color}
            iconBg={stat.bg}
          >
            <Icon className="h-6 w-6" />
          </StatCard>
        );
      })}
    </section>
  );
}