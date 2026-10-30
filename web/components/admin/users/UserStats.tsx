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

export default function UserStats() {
  const { data: session } = useSession();

  const [totalUsers, setTotalUsers] = useState(0);
  const [employees, setEmployees] = useState(0);
  const [organizers, setOrganizers] = useState(0);
  const [regularUsers, setRegularUsers] = useState(0);

  useEffect(() => {
    async function fetchUserStats() {
      const accessToken = session?.user?.accessToken;

      if (!accessToken) return;

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
        });

        if (!response.ok) {
          console.error(
            "Failed to fetch user statistics:",
            response.status
          );
          return;
        }

        const data = await response.json();
        const users: ApiUser[] = Array.isArray(data.users)
          ? data.users
          : [];

        const manageableUsers = users.filter(
          (user) => user.role?.toUpperCase() !== "ADMIN"
        );

        setTotalUsers(manageableUsers.length);

        setEmployees(
          manageableUsers.filter(
            (user) => user.role?.toUpperCase() === "EMPLOYEE"
          ).length
        );

        setOrganizers(
          manageableUsers.filter(
            (user) => user.role?.toUpperCase() === "ORGANIZER"
          ).length
        );

        setRegularUsers(
          manageableUsers.filter(
            (user) => user.role?.toUpperCase() === "USER"
          ).length
        );
      } catch (error) {
        console.error("Unable to fetch user statistics:", error);
      }
    }

    void fetchUserStats();
  }, [session]);

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      subtitle: "Manageable system accounts",
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-500/10",
    },
    {
      title: "Employees",
      value: employees,
      subtitle: "System employees",
      icon: ClipboardList,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-500/10",
    },
    {
      title: "Organizers",
      value: organizers,
      subtitle: "System organizers",
      icon: UserRoundCog,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Users",
      value: regularUsers,
      subtitle: "Registered users",
      icon: UserCog,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-500/10",
    },
  ];

  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            iconColor={stat.iconColor}
            iconBg={stat.iconBg}
          >
            <Icon className="h-7 w-7" />
          </StatCard>
        );
      })}
    </section>
  );
}
