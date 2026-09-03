import {
  CalendarRange,
  Mountain,
  Filter,
} from "lucide-react";

import Select from "@/components/ui/Select";

export default function CalendarFilters() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Calendar Overview
      </h2>

      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Month */}

        <div className="relative">
          <CalendarRange className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <Select
            defaultValue="August 2026"
            className="pl-10"
          >
            <option>August 2026</option>
            <option>September 2026</option>
            <option>October 2026</option>
          </Select>
        </div>

        {/* Trail */}

        <div className="relative">
          <Mountain className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <Select
            defaultValue="All Trails"
            className="pl-10"
          >
            <option>All Trails</option>
            <option>Ambangeg Trail</option>
            <option>Akiki Trail</option>
            <option>Tawangan Trail</option>
          </Select>
        </div>

        {/* Event Type */}

        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-400" />

          <Select
            defaultValue="All Events"
            className="pl-10"
          >
            <option>All Events</option>
            <option>Reservations</option>
            <option>Fully Booked</option>
            <option>Maintenance</option>
            <option>Holidays</option>
          </Select>
        </div>
      </div>
    </div>
  );
}