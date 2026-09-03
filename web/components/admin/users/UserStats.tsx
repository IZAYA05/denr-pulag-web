"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import {
  ClipboardList,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import StatCard from "@/components/ui/StatCard";

interface ApiUser {
  id: number;
  role: string;
}

export default function UserStats() {
  const { data: session } = useSession();

  const [totalUsers, setTotalUsers] = useState(0);
  const [administrators, setAdministrators] =
    useState(0);
  const [employees, setEmployees] =
    useState(0);
  const [regularUsers, setRegularUsers] =
    useState(0);

  useEffect(() => {
    async function fetchUserStats() {
      if (!session?.user?.accessToken) {
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/users`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          console.error(
            "Failed to fetch user statistics:",
            response.status
          );

          return;
        }

        const data = await response.json();

        const users: ApiUser[] = data.users;

        setTotalUsers(users.length);

        setAdministrators(
          users.filter(
            (user) => user.role === "ADMIN"
          ).length
        );

        setEmployees(
          users.filter(
            (user) => user.role === "EMPLOYEE"
          ).length
        );

        setRegularUsers(
          users.filter(
            (user) => user.role === "USER"
          ).length
        );
      } catch (error) {
        console.error(
          "Unable to fetch user statistics:",
          error
        );
      }
    }

    fetchUserStats();
  }, [session]);

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      subtitle: "All system users",
      icon: Users,
      iconColor:
        "text-blue-600 dark:text-blue-400",
      iconBg:
        "bg-blue-100 dark:bg-blue-500/10",
    },
    {
      title: "Administrators",
      value: administrators,
      subtitle: "System administrators",
      icon: ShieldCheck,
      iconColor:
        "text-purple-600 dark:text-purple-400",
      iconBg:
        "bg-purple-100 dark:bg-purple-500/10",
    },
    {
      title: "Employees",
      value: employees,
      subtitle: "System employees",
      icon: ClipboardList,
      iconColor:
        "text-emerald-600 dark:text-emerald-400",
      iconBg:
        "bg-emerald-100 dark:bg-emerald-500/10",
    },
    {
      title: "Users",
      value: regularUsers,
      subtitle: "Registered users",
      icon: UserCog,
      iconColor:
        "text-amber-600 dark:text-amber-400",
      iconBg:
        "bg-amber-100 dark:bg-amber-500/10",
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