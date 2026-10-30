"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Compass,
  LayoutDashboard,
  Mountain,
  UserRound,
  X,
} from "lucide-react";

type UserSidebarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const navigation = [
  {
    title: "YOUR JOURNEY",
    items: [
      {
        label: "Browse Packages",
        href: "/user",
        icon: Compass,
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
        label: "My Profile",
        href: "/user/profile",
        icon: UserRound,
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
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col
          border-r border-zinc-200/80 bg-white
          shadow-xl shadow-zinc-950/5
          transition-[width,transform] duration-300 ease-in-out
          dark:border-zinc-800 dark:bg-zinc-950
          ${collapsed ? "lg:w-[88px]" : "lg:w-[280px]"}
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-zinc-100 px-4 dark:border-zinc-800">
          <Link
            href="/user"
            onClick={() => setIsOpen(false)}
            aria-label="E-PULAG home"
            className={`flex min-w-0 items-center ${
              collapsed ? "lg:justify-center" : "gap-3"
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-md shadow-emerald-950/15">
              <Mountain className="h-6 w-6" strokeWidth={1.8} />
            </div>

            <div
              className={`min-w-0 leading-tight ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
              <span className="block text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white">
                E-PULAG
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-400">
                Mount Pulag
              </span>
            </div>
          </Link>

          {/* Desktop collapse */}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-emerald-700 dark:hover:bg-zinc-800 dark:hover:text-emerald-400 lg:flex"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Small visual banner */}
        <div
          className={`px-4 pt-5 ${
            collapsed ? "lg:hidden" : ""
          }`}
        >
          <div
            className="relative overflow-hidden rounded-2xl bg-emerald-950 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(2, 35, 28, 0.88), rgba(2, 35, 28, 0.45)), url('/mount-pulag-sea-of-clouds.jpg')",
            }}
          >
            <div className="flex min-h-[90px] flex-col justify-center p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                Explore the highlands
              </p>
              <p className="mt-2 text-sm font-semibold leading-5 text-white">
                Your next adventure awaits.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav
          aria-label="User navigation"
          className="flex-1 overflow-y-auto px-3 py-6"
        >
          {navigation.map((section) => (
            <div key={section.title} className="mb-7">
              <p
                className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 ${
                  collapsed ? "text-center lg:px-0" : ""
                }`}
              >
                {collapsed ? (
                  <span className="lg:hidden">{section.title}</span>
                ) : (
                  section.title
                )}
              </p>

              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  const isActive =
                    item.href === "/user"
                      ? pathname === "/user" ||
                        pathname === "/user/book"
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      aria-label={item.label}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsOpen(false)}
                      className={`
                        group relative flex min-h-11 items-center rounded-xl
                        px-3 py-3 text-sm font-medium
                        transition-colors duration-200
                        ${
                          collapsed
                            ? "justify-center lg:px-0"
                            : "gap-3"
                        }
                        ${
                          isActive
                            ? "bg-emerald-800 text-white shadow-md shadow-emerald-950/10 hover:bg-emerald-700"
                            : "text-zinc-600 hover:bg-emerald-50 hover:text-emerald-900 dark:text-zinc-400 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                        }
                      `}
                    >
                      {isActive && (
                        <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-emerald-300" />
                      )}

                      <Icon
                        className={`h-5 w-5 shrink-0 ${
                          isActive
                            ? "text-emerald-100"
                            : "text-zinc-500 transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
                        }`}
                        strokeWidth={1.8}
                      />

                      <span
                        className={`truncate ${
                          collapsed ? "lg:hidden" : ""
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          className={`shrink-0 border-t border-zinc-100 p-4 dark:border-zinc-800 ${
            collapsed ? "lg:px-3" : ""
          }`}
        >
          <div
            className={`flex items-center rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900 ${
              collapsed ? "justify-center lg:p-2" : "gap-3"
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Mountain className="h-4 w-4" />
            </div>

            <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                E-PULAG Portal
              </p>
              <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                Mount Pulag reservations
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
