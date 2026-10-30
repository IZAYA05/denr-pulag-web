
"use client";

import { useSession, signOut } from "next-auth/react";
import {
  UserRound,
  Mail,
  ShieldCheck,
  BriefcaseBusiness,
  LogOut,
} from "lucide-react";

export default function EmployeeProfile() {
  const { data: session, status } = useSession();

  const user = session?.user;
  const name = user?.name || "Employee";
  const email = user?.email || "No email available";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  if (status === "loading") {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Employee Workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          My Profile
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          View your account information and employee access details.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="h-32 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-emerald-50 text-2xl font-bold text-emerald-700 shadow-sm dark:border-zinc-900 dark:bg-emerald-950 dark:text-emerald-300">
                {initials || "E"}
              </div>
              <div className="pb-1">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {name}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Employee Account
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
              <ShieldCheck size={15} />
              Employee access
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Account Information
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Information associated with your current sign-in.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-zinc-100 p-3 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <UserRound size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Full name
                </p>
                <p className="mt-1 break-words font-medium text-zinc-900 dark:text-white">
                  {name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-zinc-100 p-3 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <Mail size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Email address
                </p>
                <p className="mt-1 break-words font-medium text-zinc-900 dark:text-white">
                  {email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-zinc-100 p-3 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <BriefcaseBusiness size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Account role
                </p>
                <p className="mt-1 font-medium text-zinc-900 dark:text-white">
                  Employee
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Account Actions
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage your current session.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={20}
                className="mt-0.5 text-emerald-600 dark:text-emerald-400"
              />
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Protected employee access
                </p>
                <p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
                  Your dashboard is available according to your assigned account role.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/login" })}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </section>
    </div>
  );
}
