import ReservationStatusBadge from "./ReservationStatusBadge";
import ReservationActions from "./ReservationActions";

export type ReservationStatus =
  | "Pending"
  | "Approved"
  | "Cancelled";

export interface Reservation {
  id: string;
  leader: string;
  trail: string;
  date: string;
  participants: number;
  status: ReservationStatus;
}

const reservations: Reservation[] = [
  {
    id: "R-2026-001",
    leader: "Juan Dela Cruz",
    trail: "Ambangeg",
    date: "Aug 15, 2026",
    participants: 8,
    status: "Approved",
  },
  {
    id: "R-2026-002",
    leader: "Maria Santos",
    trail: "Akiki",
    date: "Aug 16, 2026",
    participants: 12,
    status: "Pending",
  },
  {
    id: "R-2026-003",
    leader: "John Cruz",
    trail: "Ambangeg",
    date: "Aug 18, 2026",
    participants: 5,
    status: "Cancelled",
  },
  {
    id: "R-2026-004",
    leader: "Angela Ramos",
    trail: "Tawangan",
    date: "Aug 20, 2026",
    participants: 10,
    status: "Approved",
  },
];

export default function ReservationTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr className="text-left">
              <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Booking ID
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Group Leader
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Trail
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Hike Date
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Participants
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Status
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {reservations.map((reservation) => (
              <tr
                key={reservation.id}
                className="border-b border-zinc-200 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
              >
                <td className="px-6 py-5 font-medium text-zinc-900 dark:text-white">
                  {reservation.id}
                </td>

                <td className="px-6 py-5 text-zinc-700 dark:text-zinc-300">
                  {reservation.leader}
                </td>

                <td className="px-6 py-5 text-zinc-700 dark:text-zinc-300">
                  {reservation.trail}
                </td>

                <td className="px-6 py-5 text-zinc-700 dark:text-zinc-300">
                  {reservation.date}
                </td>

                <td className="px-6 py-5 text-center text-zinc-700 dark:text-zinc-300">
                  {reservation.participants}
                </td>

                <td className="px-6 py-5 text-center">
                  <ReservationStatusBadge status={reservation.status} />
                </td>

                <td className="px-6 py-5 text-right">
                  <ReservationActions />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}