"use client";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function BookingSettings() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Booking Settings
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Configure reservation limits and booking policies.
        </p>
      </div>

      <div className="space-y-5">
        <Input
          label="Maximum Hikers Per Day"
          type="number"
          defaultValue={500}
        />

        <Input
          label="Maximum Participants Per Group"
          type="number"
          defaultValue={12}
        />

        <Input
          label="Booking Window (Days Before Hike)"
          type="number"
          defaultValue={30}
        />

        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4 dark:border-zinc-700">
          <div>
            <h4 className="font-medium text-zinc-900 dark:text-white">
              Allow Weekend Bookings
            </h4>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Enable reservations on Saturdays and Sundays.
            </p>
          </div>

          <input
            type="checkbox"
            defaultChecked
            className="h-5 w-5 accent-emerald-600"
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4 dark:border-zinc-700">
          <div>
            <h4 className="font-medium text-zinc-900 dark:text-white">
              Allow Holiday Bookings
            </h4>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Enable reservations during public holidays.
            </p>
          </div>

          <input
            type="checkbox"
            className="h-5 w-5 accent-emerald-600"
          />
        </div>

        <div className="pt-2">
          <Button type="button">
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
}