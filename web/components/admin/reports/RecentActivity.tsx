"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  CalendarCheck,
  ClipboardList,
  Clock,
  MessageCircle,
  Mountain,
  RefreshCw,
  UserPlus,
} from "lucide-react";

import { useDashboard } from "@/components/admin/DashboardClient";
import Card from "@/components/ui/Card";

type ActivityActor = {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
} | null;

type ActivityLog = {
  id: number;
  action: string;
  module: string;
  description: string | null;
  role?: string;
  created_at: string;

  user?: ActivityActor;
  initiatedBy?: ActivityActor;

  conversation_id?: number | null;
  initiated_by_user_id?: number | null;
  message_count?: number;
  first_activity_at?: string | null;
  last_activity_at?: string | null;
  conversation_status?: string | null;
  conversation_type?: string | null;

  conversation?: {
    id: number;
    type: string;
    status: string;
    subject?: string | null;
    user_id?: number | null;
    organizer_id?: number | null;
    recipient_id?: number | null;
    package_booking_id?: number | null;
  } | null;
};

type ActivityResponse = {
  message?: string;
  data?: {
    data?: ActivityLog[];
  };
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

function formatTime(value?: string | null) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatAction(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getIcon(module: string) {
  switch (module.toUpperCase()) {
    case "RESERVATION":
    case "RESERVATIONS":
      return CalendarCheck;

    case "TRAIL":
    case "TRAILS":
      return Mountain;

    case "USER":
    case "USERS":
      return UserPlus;

    case "PACKAGE":
    case "PACKAGE_BOOKING":
    case "PACKAGE_BOOKINGS":
      return ClipboardList;

    case "MESSAGING":
      return MessageCircle;

    default:
      return Activity;
  }
}

function getIconStyle(module: string) {
  switch (module.toUpperCase()) {
    case "RESERVATION":
    case "RESERVATIONS":
      return "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";

    case "TRAIL":
    case "TRAILS":
      return "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";

    case "USER":
    case "USERS":
      return "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";

    case "MESSAGING":
      return "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400";

    default:
      return "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400";
  }
}

function getActorName(activity: ActivityLog) {
  const actor = activity.initiatedBy || activity.user;

  if (!actor) {
    return "Unknown account";
  }

  const name = [
    actor.first_name,
    actor.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return name || actor.email || "Unknown account";
}

function isConversationSummary(activity: ActivityLog) {
  return (
    activity.action === "CONVERSATION_SUMMARY" &&
    activity.module === "MESSAGING"
  );
}

export default function RecentActivity() {
  const { accessToken } = useDashboard();

  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActivities = useCallback(
    async (signal?: AbortSignal) => {
      if (!accessToken) {
        setActivities([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/activity-logs?per_page=8`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
            signal,
          }
        );

        const result: ActivityResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load activity logs."
          );
        }

        if (!signal?.aborted) {
          setActivities(
            Array.isArray(result.data?.data)
              ? result.data.data
              : []
          );
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load recent activity."
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [accessToken]
  );

  useEffect(() => {
    const controller = new AbortController();

    void fetchActivities(controller.signal);

    return () => controller.abort();
  }, [fetchActivities]);

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Recent Activity
          </h3>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Latest recorded actions across the system.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchActivities()}
          disabled={loading}
          aria-label="Refresh activity logs"
          className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-zinc-500">
          Loading activity logs...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
        >
          {error}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="rounded-xl bg-zinc-100 p-3 text-zinc-500 dark:bg-zinc-800">
            <Activity size={24} />
          </div>

          <p className="mt-3 font-medium text-zinc-800 dark:text-zinc-200">
            No activity recorded
          </p>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Actual system activities will appear here when recorded.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {activities.map((activity) => {
            const Icon = getIcon(activity.module || "");
            const conversationSummary =
              isConversationSummary(activity);

            const conversationType =
              activity.conversation_type ||
              activity.conversation?.type;

            const conversationStatus =
              activity.conversation_status ||
              activity.conversation?.status;

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${getIconStyle(activity.module || "")}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-medium text-zinc-900 dark:text-white">
                      {conversationSummary
                        ? "Conversation Activity"
                        : formatAction(activity.action)}
                    </h4>

                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {activity.module}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                    {activity.description || "No description recorded."}
                  </p>

                  {conversationSummary && (
                    <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Conversation Type
                          </p>
                          <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            {conversationType
                              ? formatAction(conversationType)
                              : "Unknown"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Status
                          </p>
                          <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            {conversationStatus
                              ? formatAction(conversationStatus)
                              : "Unknown"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Total Messages
                          </p>
                          <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            {activity.message_count ?? 0}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Conversation ID
                          </p>
                          <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            #{activity.conversation_id ?? activity.conversation?.id ?? "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                        <div className="flex items-start gap-2">
                          <Clock
                            size={14}
                            className="mt-0.5 shrink-0 text-zinc-400"
                          />
                          <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              First Activity
                            </p>
                            <p className="text-xs text-zinc-700 dark:text-zinc-300">
                              {formatTime(activity.first_activity_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Clock
                            size={14}
                            className="mt-0.5 shrink-0 text-zinc-400"
                          />
                          <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Last Activity
                            </p>
                            <p className="text-xs text-zinc-700 dark:text-zinc-300">
                              {formatTime(activity.last_activity_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-zinc-400">
                    {getActorName(activity)} ·{" "}
                    {formatTime(
                      conversationSummary
                        ? activity.last_activity_at || activity.created_at
                        : activity.created_at
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
