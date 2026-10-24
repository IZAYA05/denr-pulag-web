"use client";

import { Calendar, Search } from "lucide-react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import { useBookings } from "./BookingContext";

export default function BookingFilters() {
  const {
    search,
    statusFilter,
    coordinationFilter,
    dateFilter,
    setSearch,
    setStatusFilter,
    setCoordinationFilter,
    setDateFilter,
  } = useBookings();

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <Input
            type="text"
            placeholder="Search booking ID or package..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-11"
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          options={[
            "All Status",
            "Pending",
            "Confirmed",
            "Cancelled",
            "Completed",
          ]}
        />

        <Select
          value={coordinationFilter}
          onChange={(event) =>
            setCoordinationFilter(event.target.value)
          }
          options={[
            "All Verification Statuses",
            "Not Verified",
            "Verification Pending",
            "Verified",
          ]}
        />

        <div className="relative">
          <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <Input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="pl-11"
          />
        </div>
      </div>
    </Card>
  );
}
