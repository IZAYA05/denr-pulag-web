"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const events = [
  {
    title: "Ambangeg Trail",
    date: "2026-08-05",
    color: "#10b981",
  },
  {
    title: "Akiki Trail",
    date: "2026-08-10",
    color: "#3b82f6",
  },
  {
    title: "Trail Maintenance",
    date: "2026-08-15",
    color: "#ef4444",
  },
  {
    title: "Fully Booked",
    date: "2026-08-20",
    color: "#f59e0b",
  },
  {
    title: "Holiday",
    date: "2026-08-25",
    color: "#8b5cf6",
  },
];

export default function BookingCalendar() {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Booking Calendar
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          View reservations, maintenance schedules, holidays, and fully booked
          dates.
        </p>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={events}
        editable={false}
        selectable={true}
        dayMaxEvents={true}
        weekends={true}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
      />
    </div>
  );
}