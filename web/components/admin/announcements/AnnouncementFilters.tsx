"use client";

import { Filter, Plus, Search } from "lucide-react";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

type AnnouncementFiltersProps = {
  onNewAnnouncement: () => void;
};

export default function AnnouncementFilters({
  onNewAnnouncement,
}: AnnouncementFiltersProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Search */}

      <div className="relative w-full lg:max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

        <Input
          type="text"
          placeholder="Search announcements..."
          className="pl-11"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Status Filter */}

        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <Select
            defaultValue="All Status"
            className="pl-10"
          >
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
            <option>Scheduled</option>
            <option>Archived</option>
          </Select>
        </div>

        {/* New Announcement */}

        <Button
          type="button"
          variant="primary"
          onClick={onNewAnnouncement}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      </div>
    </div>
  );
}