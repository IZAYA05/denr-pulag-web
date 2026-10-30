import Link from "next/link";
import {
  ClipboardList,
  ChartNoAxesCombined,
  Users,
  ArrowRight,
} from "lucide-react";

import EmployeeStats from "@/components/employee/EmployeeStats";
import EmployeeRecentBookings from "@/components/employee/EmployeeRecentBookings";

const quickLinks = [
  {
    title: "Manage Bookings",
    description: "Review reservation requests and booking records.",
    href: "/employee/bookings",
    icon: ClipboardList,
  },
  {
    title: "Visitor Records",
    description: "Search visitor information and booking details.",
    href: "/employee/visitors",
    icon: Users,
  },
  {
    title: "Daily Reports",
    description: "Review confirmed visitor totals by hiking date.",
    href: "/employee/reports",
    icon: ChartNoAxesCombined,
  },
];

export default function EmployeeDashboard() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Employee Workspace
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Dashboard Overview
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Monitor Mount Pulag bookings, visitor activity, and trail information
          from your employee workspace.
        </p>
      </section>

      <EmployeeStats />

      <EmployeeRecentBookings />

      <section>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Quick Access
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Jump directly to your daily tasks.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-emerald-500/50 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                    <Icon size={22} />
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-zinc-400 transition group-hover:translate-x-1 group-hover:text-emerald-500"
                  />
                </div>

                <h4 className="mt-4 font-semibold text-zinc-900 dark:text-white">
                  {item.title}
                </h4>

                <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
