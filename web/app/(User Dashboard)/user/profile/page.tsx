"use client";

import { useSession } from "next-auth/react";
import {
  UserRound,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const name = session?.user?.name || "User";
  const email = session?.user?.email || "Not provided";
  const initial = name.charAt(0).toUpperCase() || "U";

  if (status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-500">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="rounded-3xl bg-emerald-950 px-6 py-8 text-white sm:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-2xl font-bold">
            {initial}
          </div>

          <div>
            <p className="text-sm text-emerald-200">
              Account Settings
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              My Profile
            </h1>
            <p className="mt-1 text-sm text-emerald-100/80">
              View your account information.
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Personal Information
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Your account details currently available in E-PULAG.
          </p>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <div className="flex items-start gap-4 px-6 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <UserRound className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Full Name
              </p>
              <p className="mt-1 break-words font-medium text-zinc-900 dark:text-white">
                {name}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 px-6 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Mail className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Email Address
              </p>
              <p className="mt-1 break-words font-medium text-zinc-900 dark:text-white">
                {email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 px-6 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Account Status
              </p>
              <p className="mt-1 font-medium text-emerald-700 dark:text-emerald-400">
                Signed In
              </p>
            </div>
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
        E-PULAG · Mount Pulag Booking System
      </p>
    </div>
  );
}