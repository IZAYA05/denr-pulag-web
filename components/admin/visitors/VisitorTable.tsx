import VisitorStatusBadge from "./VisitorStatusBadge";
import VisitorActions from "./VisitorActions";

export type VisitorStatus =
  | "Checked In"
  | "Pending"
  | "No Show";

export interface Visitor {
  id: string;
  reservationId: string;
  name: string;
  trail: string;
  visitDate: string;
  status: VisitorStatus;
}

const visitors: Visitor[] = [
  {
    id: "V-2026-001",
    reservationId: "R-2026-001",
    name: "Juan Dela Cruz",
    trail: "Ambangeg",
    visitDate: "Aug 15, 2026",
    status: "Checked In",
  },
  {
    id: "V-2026-002",
    reservationId: "R-2026-001",
    name: "Maria Santos",
    trail: "Ambangeg",
    visitDate: "Aug 15, 2026",
    status: "Checked In",
  },
  {
    id: "V-2026-003",
    reservationId: "R-2026-002",
    name: "John Cruz",
    trail: "Akiki",
    visitDate: "Aug 16, 2026",
    status: "Pending",
  },
  {
    id: "V-2026-004",
    reservationId: "R-2026-003",
    name: "Angela Ramos",
    trail: "Tawangan",
    visitDate: "Aug 18, 2026",
    status: "No Show",
  },
];

export default function VisitorTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr className="text-left">
              <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Visitor ID
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Reservation ID
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Visitor Name
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Trail
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Visit Date
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
            {visitors.map((visitor) => (
              <tr
                key={visitor.id}
                className="border-b border-zinc-200 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
              >
                <td className="px-6 py-5 font-medium text-zinc-900 dark:text-white">
                  {visitor.id}
                </td>

                <td className="px-6 py-5 text-zinc-700 dark:text-zinc-300">
                  {visitor.reservationId}
                </td>

                <td className="px-6 py-5 text-zinc-700 dark:text-zinc-300">
                  {visitor.name}
                </td>

                <td className="px-6 py-5 text-zinc-700 dark:text-zinc-300">
                  {visitor.trail}
                </td>

                <td className="px-6 py-5 text-zinc-700 dark:text-zinc-300">
                  {visitor.visitDate}
                </td>

                <td className="px-6 py-5 text-center">
                  <VisitorStatusBadge status={visitor.status} />
                </td>

                <td className="px-6 py-5 text-right">
                  <VisitorActions />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}