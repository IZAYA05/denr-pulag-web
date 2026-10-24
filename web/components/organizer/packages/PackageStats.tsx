"use client";

import {
  Package,
  Plus,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";

import { usePackages } from "./PackageContext";

export default function PackageStats() {
  const {
    totalPackages,
    activePackages,
    inactivePackages,
    openCreate,
  } = usePackages();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Packages"
        description="Create and manage the travel packages you offer to tourists."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Package
          </Button>
        }
      />

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Packages"
          value={totalPackages}
          subtitle="Packages you have created"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600"
        >
          <Package className="h-7 w-7" />
        </StatCard>

        <StatCard
          title="Active Packages"
          value={activePackages}
          subtitle="Packages currently available"
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600"
        >
          <ToggleRight className="h-7 w-7" />
        </StatCard>

        <StatCard
          title="Inactive Packages"
          value={inactivePackages}
          subtitle="Packages currently unavailable"
          iconBg="bg-zinc-100 dark:bg-zinc-900/30"
          iconColor="text-zinc-600 dark:text-zinc-400"
        >
          <ToggleLeft className="h-7 w-7" />
        </StatCard>
      </section>
    </div>
  );
}