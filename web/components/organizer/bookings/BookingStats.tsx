
"use client";

import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Users,
} from "lucide-react";

import OrganizerBookingStat from "@/components/organizer/OrganizerBookingStat";
import { useBookings } from "./BookingContext";

export default function BookingStats() {
  const {
    totalBookings,
    confirmedBookings,
    pendingBookings,
    totalTourists,
  } = useBookings();

  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <OrganizerBookingStat
        title="Total Bookings"
        value={totalBookings}
        icon={<ClipboardList className="h-6 w-6" />}
        iconClassName="text-blue-600"
        iconBackgroundClassName="bg-blue-100 dark:bg-blue-900/30"
      />

      <OrganizerBookingStat
        title="Confirmed"
        value={confirmedBookings}
        icon={<CheckCircle2 className="h-6 w-6" />}
        iconClassName="text-emerald-600"
        iconBackgroundClassName="bg-emerald-100 dark:bg-emerald-900/30"
      />

      <OrganizerBookingStat
        title="Pending"
        value={pendingBookings}
        icon={<Calendar className="h-6 w-6" />}
        iconClassName="text-amber-600"
        iconBackgroundClassName="bg-amber-100 dark:bg-amber-900/30"
      />

      <OrganizerBookingStat
        title="Tourists"
        value={totalTourists}
        icon={<Users className="h-6 w-6" />}
        iconClassName="text-purple-600"
        iconBackgroundClassName="bg-purple-100 dark:bg-purple-900/30"
      />
    </section>
  );
}
