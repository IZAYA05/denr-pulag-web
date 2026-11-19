import OrganizerDashboardStats from "@/components/organizer/OrganizerDashboardStats";
import OrganizerUpcomingTrips from "@/components/organizer/OrganizerUpcomingTrips";
import OrganizerMyPackages from "@/components/organizer/OrganizerMyPackages";

import Link from "next/link";
import {
  CalendarDays,
  ChartNoAxesCombined,
  MessageSquare,
  ClipboardList,
  Package,
} from "lucide-react";

export default function OrganizerDashboardPage() {
  return (
    <div className="space-y-8">
      <OrganizerDashboardStats />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label: "Package Bookings",
            href: "/organizer/bookings",
            icon: ClipboardList,
          },
          {
            label: "My Packages",
            href: "/organizer/packages",
            icon: Package,
          },
          {
            label: "Booking Calendar",
            href: "/organizer/calendar",
            icon: CalendarDays,
          },
          {
            label: "Messages",
            href: "/organizer/messages",
            icon: MessageSquare,
          },
          {
            label: "Reports",
            href: "/organizer/reports",
            icon: ChartNoAxesCombined,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-sm font-semibold text-zinc-700 transition hover:border-emerald-300 hover:bg-emerald-50/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20"
            >
              <Icon className="h-5 w-5 text-emerald-600" />
              {item.label}
            </Link>
          );
        })}
      </section>

      <OrganizerUpcomingTrips />

      <OrganizerMyPackages />
    </div>
  );
}