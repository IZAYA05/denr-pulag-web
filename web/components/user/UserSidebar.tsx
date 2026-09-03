"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Mountain,
  User,
  X,
} from "lucide-react";

type UserSidebarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  isOpen: boolean;
  setIsOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
};

const navigation = [
  {
    title: "MAIN",
    items: [
      {
        label: "Dashboard",
        href: "/user",
        icon: LayoutDashboard,
      },
      {
        label: "My Reservations",
        href: "/user/reservations",
        icon: ClipboardList,
      },
      {
        label: "Announcements",
        href: "/user/announcements",
        icon: Bell,
      },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      {
        label: "Profile",
        href: "/user/profile",
        icon: User,
      },
    ],
  },
];

export default function UserSidebar({
  collapsed,
  setCollapsed,
  isOpen,
  setIsOpen,
}: UserSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col
          border-r border-zinc-200 bg-white/90 shadow-sm
          backdrop-blur-xl transition-[width,transform] duration-300
          dark:border-zinc-800 dark:bg-zinc-950/90
          ${collapsed ? "lg:w-[88px]" : "lg:w-[280px]"}
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Logo */}
        <div className="flex h-[72px] items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
          <Link
            href="/user"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600">
              <Mountain className="h-6 w-6 text-white" />
            </div>

            {!collapsed && (
              <div className="leading-tight">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  E-PULAG
                </h1>

                <p className="text-sm text-zinc-500">
                  Reservation System
                </p>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-xl border border-zinc-200 p-2 transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900 lg:flex"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {navigation.map((section) => (
            <div
              key={section.title}
              className="mb-8"
            >
              {!collapsed && (
                <p className="mb-3 px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  {section.title}
                </p>
              )}

              <div className="space-y-2">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  const isActive =
                    item.href === "/user"
                      ? pathname === "/user"
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        group flex items-center rounded-2xl px-4 py-3
                        transition-all duration-300
                        ${collapsed ? "justify-center" : "gap-3"}
                        ${
                          isActive
                            ? "bg-emerald-600 text-white"
                            : "text-zinc-600 hover:translate-x-1 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5 shrink-0" />

                      {!collapsed && (
                        <span>{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}