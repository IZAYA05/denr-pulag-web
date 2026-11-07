"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import {
  ClipboardList,
  UserCog,
  Users,
  UserRoundCog,
} from "lucide-react";

import StatCard from "@/components/ui/StatCard";

interface ApiUser {
  id: number;
  role: string;
}

interface UserStatsData {
  totalUsers: number;
  employees: number;
  organizers: number;
  regularUsers: number;
}

interface ApiResponse {
  users?: ApiUser[];
  message?: string;
}

const EMPTY_STATS: UserStatsData = {
  totalUsers: 0,
  employees: 0,
  organizers: 0,
  regularUsers: 0,
};

export default function UserStats() {
  const { data: session, status: sessionStatus } = useSession();

  const [stats, setStats] = useState<UserStatsData>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const accessToken = session?.user?.accessToken;

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUserStats() {
      if (sessionStatus === "loading") {
        setLoading(true);
        return;
      }

      if (!accessToken) {
        setStats(EMPTY_STATS);
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_LARAVEL_API_URL ||
          "http://localhost:18000";

        const response = await fetch(`${apiUrl}/api/users`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
          signal: controller.signal,
        });

        let data: ApiResponse = {};

        try {
          data = await response.json();
        } catch {
          throw new Error("Invalid response from the server.");
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to retrieve user statistics."
          );
        }

        const users = Array.isArray(data.users)
          ? data.users
          : [];

        const manageableUsers = users.filter(
          (user) => user.role?.toUpperCase() !== "ADMIN"
        );

        if (controller.signal.aborted) return;

        setStats({
          totalUsers: manageableUsers.length,

          employees: manageableUsers.filter(
            (user) => user.role?.toUpperCase() === "EMPLOYEE"
          ).length,

          organizers: manageableUsers.filter(
            (user) => user.role?.toUpperCase() === "ORGANIZER"
          ).length,

          regularUsers: manageableUsers.filter(
            (user) => user.role?.toUpperCase() === "USER"
          ).length,
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setStats(EMPTY_STATS);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to retrieve user statistics."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchUserStats();

    return () => controller.abort();
  }, [accessToken, sessionStatus]);

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      subtitle: "Manageable system accounts",
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-500/10",
    },
    {
      title: "Employees",
      value: stats.employees,
      subtitle: "System employees",
      icon: ClipboardList,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-500/10",
    },
    {
      title: "Organizers",
      value: stats.organizers,
      subtitle: "System organizers",
      icon: UserRoundCog,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Users",
      value: stats.regularUsers,
      subtitle: "Registered users",
      icon: UserCog,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-500/10",
    },
  ];

  return (
    <section>
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={
                loading
                  ? "..."
                  : error
                    ? "—"
                    : stat.value.toLocaleString()
              }
              subtitle={
                error
                  ? "Statistics unavailable"
                  : loading
                    ? "Loading records..."
                    : stat.subtitle
              }
              iconColor={stat.iconColor}
              iconBg={stat.iconBg}
            >
              <Icon className="h-7 w-7" />
            </StatCard>
          );
        })}
      </div>
    </section>
  );
}
