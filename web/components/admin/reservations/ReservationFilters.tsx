"use client";

import { Calendar, Download, Search } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export default function ReservationFilters() {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}

        <div className="flex flex-1 flex-col gap-4 md:flex-row">
          {/* Search */}

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <Input
              type="text"
              placeholder="Search booking ID or group leader..."
              className="pl-11"
            />
          </div>

          {/* Status */}

          <Select
            defaultValue="All Status"
            options={[
              "All Status",
              "Pending",
              "Approved",
              "Cancelled",
            ]}
          />

          {/* Trail */}

          <Select
            defaultValue="All Trails"
            options={[
              "All Trails",
              "Ambangeg",
              "Akiki",
              "Tawangan",
            ]}
          />

          {/* Date */}

          <div className="relative">
            <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <Input
              type="date"
              className="pl-11"
            />
          </div>
        </div>

        {/* Right */}

        <Button className="flex h-11 items-center justify-center gap-2 px-5">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </Card>
  );
}