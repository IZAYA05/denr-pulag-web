"use client";

import { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  iconColor?: string;
  iconBg?: string;
  children: ReactNode;
};

export default function DashboardCard({
  title,
  value,
  subtitle,
  iconColor = "text-emerald-600",
  iconBg = "bg-emerald-100 dark:bg-emerald-900/30",
  children,
}: DashboardCardProps) {
  return (
    <div
      className="
        group
        rounded-3xl
        border border-zinc-200
        bg-white/90
        p-6
        shadow-sm
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
        dark:border-zinc-800
        dark:bg-zinc-950/90
      "
    >
      {/* Header */}

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {value}
          </h2>
        </div>

        <div
          className={`
            flex h-14 w-14 items-center justify-center
            rounded-2xl
            ${iconBg}
          `}
        >
          <div className={iconColor}>{children}</div>
        </div>
      </div>

      {/* Footer */}

      <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {subtitle}
        </p>
      </div>
    </div>
  );
}