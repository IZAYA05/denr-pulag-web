"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileBarChart2,
  LayoutDashboard,
  Mountain,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const navigation = [
  {
    title: "MAIN",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        label: "Reservations",
        href: "/reservations",
        icon: ClipboardList,
      },
      {
        label: "Visitors",
        href: "/visitors",
        icon: Users,
      },
      {
        label: "Trails",
        href: "/trails",
        icon: Mountain,
      },
      {
        label: "Calendar",
        href: "/calendar",
        icon: CalendarDays,
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      {
        label: "Announcements",
        href: "/announcements",
        icon: Bell,
      },
      {
        label: "Reports",
        href: "/reports",
        icon: FileBarChart2,
      },
      {
        label: "Users",
        href: "/users",
        icon: ShieldCheck,
      },
    ],
  },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
  isOpen,
  setIsOpen,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          border-r border-zinc-200
          bg-white/90
          shadow-sm
          backdrop-blur-xl
          transition-[width,transform] duration-300 ease-in-out

          dark:border-zinc-800
          dark:bg-zinc-950/90

          w-[280px]

          ${collapsed ? "lg:w-[88px]" : "lg:w-[280px]"}

          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Header */}

        <div className="flex h-[72.5px] items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
          <Link
            href="/admin"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
              <Mountain
                className="h-6 w-6 text-white"
                strokeWidth={2.4}
              />
            </div>

            {!collapsed && (
              <div className="leading-tight">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  E-PULAG
                </h1>

                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Reservation System
                </p>
              </div>
            )}
          </Link>

          {/* Desktop Collapse */}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-xl border border-zinc-200 p-2 transition-all duration-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900 lg:flex"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
            )}
          </button>

          {/* Mobile Close */}

          <button
            onClick={() => setIsOpen(false)}
            className="rounded-xl p-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-900 lg:hidden"
          >
            <X className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
          </button>
        </div>

        {/* Navigation */}

        <nav className="flex-1 overflow-y-auto px-4 py-6">
                    {navigation.map((section) => (
          <div
            key={section.title}
            className="mb-8"
          >
            {/* Section Title */}

            {!collapsed && (
              <p className="mb-3 px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                {section.title}
              </p>
            )}

            <div className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon;

                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center rounded-2xl px-4 py-3 transition-all duration-300 ease-in-out ${
                      collapsed
                        ? "justify-center"
                        : "gap-3"
                    } ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-zinc-600 hover:translate-x-1 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon
                      strokeWidth={2.2}
                      className={`h-5 w-5 shrink-0 transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-zinc-500 group-hover:text-emerald-600 dark:text-zinc-400 dark:group-hover:text-emerald-400"
                      }`}
                    />

                    {!collapsed && (
                      <span className="truncate font-medium">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}

      <div className="border-t border-zinc-200 px-6 py-6 dark:border-zinc-800">
        {collapsed ? (
          <div className="flex justify-center">
            <Mountain
              className="h-6 w-6 text-emerald-600"
              strokeWidth={2.3}
            />
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
                <Mountain
                  className="h-5 w-5 text-white"
                  strokeWidth={2.3}
                />
              </div>
            </div>

            <p className="font-semibold text-zinc-900 dark:text-white">
              E-PULAG
            </p>

            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Admin Dashboard
            </p>

            <p className="mt-2 text-[11px] text-zinc-400">
              Version 1.0
            </p>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}