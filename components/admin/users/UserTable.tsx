import UserActions from "./UserActions";
import UserRoleBadge, { UserRole } from "./UserRoleBadge";
import UserStatusBadge from "./UserStatusBadge";

export type UserStatus = "Active" | "Inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
}

const users: User[] = [
  {
    id: "USR-001",
    name: "Juan Dela Cruz",
    email: "admin@epulag.com",
    role: "Administrator",
    status: "Active",
    lastLogin: "Jul 31, 2026",
  },
  {
    id: "USR-002",
    name: "Maria Santos",
    email: "booking@epulag.com",
    role: "Booking Officer",
    status: "Active",
    lastLogin: "Jul 30, 2026",
  },
  {
    id: "USR-003",
    name: "Pedro Ramos",
    email: "ranger@epulag.com",
    role: "Park Ranger",
    status: "Inactive",
    lastLogin: "Jul 22, 2026",
  },
  {
    id: "USR-004",
    name: "Angela Cruz",
    email: "booking2@epulag.com",
    role: "Booking Officer",
    status: "Active",
    lastLogin: "Jul 29, 2026",
  },
];

export default function UserTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Name
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Email
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Role
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Status
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Last Login
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-zinc-100 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">
                      {user.name}
                    </p>

                    <p className="text-xs text-zinc-500">
                      {user.id}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                  {user.email}
                </td>

                <td className="px-6 py-4">
                  <UserRoleBadge role={user.role} />
                </td>

                <td className="px-6 py-4">
                  <UserStatusBadge status={user.status} />
                </td>

                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                  {user.lastLogin}
                </td>

                <td className="px-6 py-4 text-right">
                  <UserActions />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}