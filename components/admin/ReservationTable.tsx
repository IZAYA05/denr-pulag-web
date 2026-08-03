"use client";

export type Reservation = {
  id: string;
  visitor: string;
  trail: string;
  date: string;
  status: "Approved" | "Pending" | "Cancelled";
};

type ReservationTableProps = {
  reservations: Reservation[];
};

export default function ReservationTable({
  reservations,
}: ReservationTableProps) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white/90 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
      <table className="min-w-full">
        <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-500">
              Reservation ID
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-500">
              Visitor
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-500">
              Trail
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-500">
              Date
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-500">
              Status
            </th>

            <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
                      {reservations.length > 0 ? (
            reservations.map((reservation) => (
              <tr
                key={reservation.id}
                className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/40"
              >
                <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                  {reservation.id}
                </td>

                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                  {reservation.visitor}
                </td>

                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                  {reservation.trail}
                </td>

                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                  {reservation.date}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
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

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
                      View
                    </button>

                    <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white transition hover:bg-emerald-700">
                      Edit
                    </button>

                    <button className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white transition hover:bg-red-700">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400"
              >
                No reservations found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}