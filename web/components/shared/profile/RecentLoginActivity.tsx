"use client";

import { Clock, LogIn, LogOut, Monitor } from "lucide-react";

import Card from "@/components/ui/Card";
import { useProfile } from "./ProfileContext";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function RecentLoginActivity() {
  const { loginActivity, loading } = useProfile();

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Recent Login Activity
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Review recent login and logout activity associated with your account.
        </p>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Loading login activity...
        </div>
      ) : loginActivity.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700">
          <Clock className="mx-auto h-8 w-8 text-zinc-400" />

          <p className="mt-3 font-medium text-zinc-700 dark:text-zinc-300">
            No login activity available
          </p>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Your recorded login and logout activity will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {loginActivity.map((activity) => {
            const isLogout =
              activity.action?.toUpperCase() === "LOGOUT";

            const Icon = isLogout ? LogOut : LogIn;

            const actionLabel = isLogout
              ? "Logged Out"
              : "Logged In";

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-2xl border border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-medium text-zinc-900 dark:text-white">
                      {actionLabel}
                    </h4>

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        isLogout
                          ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      }`}
                    >
                      {activity.module}
                    </span>
                  </div>

                  {activity.description && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {activity.description}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDate(activity.created_at)}
                    </span>

                    {activity.ip_address && (
                      <span className="flex items-center gap-1">
                        <Monitor className="h-4 w-4" />
                        IP: {activity.ip_address}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
