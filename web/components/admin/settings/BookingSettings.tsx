import Card from "@/components/ui/Card";

const bookingPolicies = [
  {
    label: "Daily Visitor Capacity",
    value: "500 visitors",
    description:
      "Maximum combined visitor capacity per day.",
  },
  {
    label: "Maximum Group Size",
    value: "12 participants",
    description:
      "Maximum number of participants in one group booking.",
  },
  {
    label: "Advance Booking Window",
    value: "30 days",
    description:
      "Bookings may be submitted up to one month before the hiking date.",
  },
  {
    label: "Holiday Bookings",
    value: "Not permitted",
    description:
      "Bookings are not allowed on holidays.",
  },
];

export default function BookingSettings() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Booking Policies
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Current booking limits and visitor regulations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {bookingPolicies.map((policy) => (
          <div
            key={policy.label}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {policy.label}
            </p>

            <p className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">
              {policy.value}
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              {policy.description}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-5 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
        These policies represent the system's established booking
        requirements. Changes must be handled through authorized
        system configuration.
      </p>
    </Card>
  );
}
