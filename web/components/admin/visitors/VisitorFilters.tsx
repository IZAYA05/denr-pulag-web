"use client";

import { Download, Search } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export default function VisitorFilters() {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}

        <div className="flex flex-1 flex-col gap-4 lg:flex-row">
          {/* Search */}

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

            <Input
              type="text"
              placeholder="Search visitor..."
              className="pl-12"
            />
          </div>

          {/* Status */}

          <Select
            defaultValue="All Status"
            options={[
              "All Status",
              "Checked In",
              "Pending",
              "No Show",
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

          <Input type="date" />

        </div>

        {/* Export */}

        <Button className="flex items-center justify-center gap-2 px-5">
          <Download className="h-5 w-5" />
          Export
        </Button>
      </div>
    </Card>
  );
}