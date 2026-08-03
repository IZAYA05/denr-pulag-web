"use client";

const reservations = [
  {
    id: "RSV-1001",
    visitor: "Juan Dela Cruz",
    trail: "Ambangeg",
    date: "Jul 30, 2026",
    status: "Approved",
  },
  {
    id: "RSV-1002",
    visitor: "Maria Santos",
    trail: "Akiki",
    date: "Jul 31, 2026",
    status: "Pending",
  },
  {
    id: "RSV-1003",
    visitor: "Peter Ramos",
    trail: "Ambangeg",
    date: "Aug 2, 2026",
    status: "Cancelled",
  },
  {
    id: "RSV-1004",
    visitor: "Angela Cruz",
    trail: "Tawangan",
    date: "Aug 4, 2026",
    status: "Approved",
  },
];

export default function RecentReservations() {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Recent Reservations
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Latest booking activities
          </p>
        </div>

        <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">
          View All
        </button>
      </div>

      {/* Table */}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-zinc-200 dark:border-zinc-800">
            <tr className="text-left">
              <th className="pb-4 text-sm font-semibold text-zinc-500">
                Reservation ID
              </th>

              <th className="pb-4 text-sm font-semibold text-zinc-500">
                Visitor
              </th>

              <th className="pb-4 text-sm font-semibold text-zinc-500">
                Trail
              </th>

              <th className="pb-4 text-sm font-semibold text-zinc-500">
                Date
              </th>

              <th className="pb-4 text-sm font-semibold text-zinc-500">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
                      {reservations.map((reservation) => (
            <tr
              key={reservation.id}
              className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/40"
            >
              <td className="py-4">
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {reservation.id}
                </span>
              </td>

              <td className="py-4 text-zinc-600 dark:text-zinc-300">
                {reservation.visitor}
              </td>

              <td className="py-4 text-zinc-600 dark:text-zinc-300">
                {reservation.trail}
              </td>

              <td className="py-4 text-zinc-600 dark:text-zinc-300">
                {reservation.date}
              </td>

              <td className="py-4">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    reservation.status === "Approved"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : reservation.status === "Pending"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {reservation.status}
                </span>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}