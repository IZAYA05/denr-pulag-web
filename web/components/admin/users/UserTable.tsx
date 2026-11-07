"use client";

import { Eye, Pencil, UserX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export type UserRole =
  | "Administrator"
  | "Employee"
  | "Organizer"
  | "User";

export type UserStatus = "Active" | "Inactive";

export interface User {
  id: string;
  databaseId: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  lastUpdated: string;
}

interface ApiUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UserTableProps {
  search: string;
  role: string;
  status: string;
}

interface ApiResponse {
  users?: ApiUser[];
  message?: string;
}

function formatRole(role: string): UserRole {
  switch (role.toUpperCase()) {
    case "ADMIN":
      return "Administrator";
    case "EMPLOYEE":
      return "Employee";
    case "ORGANIZER":
      return "Organizer";
    case "USER":
      return "User";
    default:
      return "User";
  }
}

function formatApiRole(role: UserRole): string {
  switch (role) {
    case "Administrator":
      return "ADMIN";
    case "Employee":
      return "EMPLOYEE";
    case "Organizer":
      return "ORGANIZER";
    case "User":
      return "USER";
  }
}

function formatUpdatedDate(value: string | null | undefined) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function readApiResponse(
  response: Response
): Promise<ApiResponse> {
  try {
    const payload: unknown = await response.json();

    if (
      typeof payload === "object" &&
      payload !== null
    ) {
      return payload as ApiResponse;
    }
  } catch {
    // The response may not contain valid JSON.
  }

  return {};
}

export default function UserTable({
  search,
  role,
  status,
}: UserTableProps) {
  const { data: session, status: sessionStatus } = useSession();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tableError, setTableError] = useState("");

  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("User");

  const [isSaving, setIsSaving] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [editError, setEditError] = useState("");

  const accessToken = session?.user?.accessToken;

  const apiUrl =
    process.env.NEXT_PUBLIC_LARAVEL_API_URL ||
    "http://localhost:18000";

  const fetchUsers = useCallback(
    async (signal?: AbortSignal): Promise<boolean> => {
      if (!accessToken) {
        return false;
      }

      try {
        const response = await fetch(`${apiUrl}/api/users`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
          signal,
        });

        const data = await readApiResponse(response);

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to retrieve user records."
          );
        }

        const formattedUsers: User[] = (
          Array.isArray(data.users) ? data.users : []
        ).map((user) => ({
          id: `USR-${String(user.id).padStart(3, "0")}`,
          databaseId: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          phone: user.phone ?? "",
          role: formatRole(user.role),
          status:
            user.status?.toUpperCase() === "INACTIVE"
              ? "Inactive"
              : "Active",
          lastUpdated: formatUpdatedDate(user.updated_at),
        }));

        if (signal?.aborted) {
          return false;
        }

        // Administrator accounts are excluded from user management.
        setUsers(
          formattedUsers.filter(
            (user) => user.role !== "Administrator"
          )
        );

        setLoadError("");
        return true;
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return false;
        }

        if (!signal?.aborted) {
          setUsers([]);
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to retrieve user records."
          );
        }

        return false;
      }
    },
    [accessToken, apiUrl]
  );

  useEffect(() => {
    if (sessionStatus === "loading") {
      setIsLoading(true);
      return;
    }

    if (!accessToken) {
      setUsers([]);
      setLoadError("You are not authenticated.");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    setIsLoading(true);

    void fetchUsers(controller.signal).finally(() => {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    });

    return () => controller.abort();
  }, [accessToken, sessionStatus, fetchUsers]);

  function handleView(user: User) {
    setViewingUser(user);
    setIsViewOpen(true);
  }

  function handleEdit(user: User) {
    if (user.role === "Administrator") return;

    setEditingUser(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPhone(user.phone);
    setSelectedRole(user.role);
    setEditError("");
    setIsEditOpen(true);
  }

  function closeEditModal() {
    if (isSaving) return;

    setIsEditOpen(false);
    setEditingUser(null);
    setEditError("");
  }

  async function handleSaveChanges() {
    if (!editingUser || editingUser.role === "Administrator") {
      return;
    }

    if (!accessToken) {
      setEditError("You are not authenticated.");
      return;
    }

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim()
    ) {
      setEditError("First name, last name, and email are required.");
      return;
    }

    setIsSaving(true);
    setEditError("");

    try {
      const response = await fetch(
        `${apiUrl}/api/users/${editingUser.databaseId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            role: formatApiRole(selectedRole),
          }),
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok) {
        setEditError(data.message || "Failed to update user.");
        return;
      }

      const refreshed = await fetchUsers();

      if (!refreshed) {
        setEditError(
          "The user was updated, but the user list could not be refreshed."
        );
        return;
      }

      setIsEditOpen(false);
      setEditingUser(null);
    } catch {
      setEditError("Something went wrong while updating the user.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleStatus(user: User) {
    if (
      user.role === "Administrator" ||
      updatingUserId !== null
    ) {
      return;
    }

    if (!accessToken) {
      setTableError("You are not authenticated.");
      return;
    }

    setUpdatingUserId(user.databaseId);
    setTableError("");

    try {
      const response = await fetch(
        `${apiUrl}/api/users/${user.databaseId}/status`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok) {
        setTableError(
          data.message || "Failed to update account status."
        );
        return;
      }

      const refreshed = await fetchUsers();

      if (!refreshed) {
        setTableError(
          "Account status was updated, but the user list could not be refreshed."
        );
      }
    } catch {
      setTableError(
        "Something went wrong while updating the account."
      );
    } finally {
      setUpdatingUserId(null);
    }
  }

  const filteredUsers = users.filter((user) => {
    const term = search.toLowerCase();

    const matchesSearch =
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term);

    const matchesRole =
      role === "All Roles" || user.role === role;

    const matchesStatus =
      status === "All Status" || user.status === status;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <>
      {loadError && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
        >
          {loadError}
        </div>
      )}

      {tableError && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
        >
          {tableError}
        </div>
      )}

      <Table>
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
              Last Updated
            </th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
              >
                Loading users...
              </td>
            </tr>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
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
                  <Badge
                    variant={
                      user.role === "Employee"
                        ? "secondary"
                        : user.role === "Organizer"
                          ? "warning"
                          : "success"
                    }
                  >
                    {user.role}
                  </Badge>
                </td>

                <td className="px-6 py-4">
                  <Badge
                    variant={
                      user.status === "Active"
                        ? "success"
                        : "danger"
                    }
                  >
                    {user.status}
                  </Badge>
                </td>

                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                  {user.lastUpdated}
                </td>

                <td className="px-6 py-4 text-right">
                  <Dropdown>
                    <Button
                      variant="ghost"
                      onClick={() => handleView(user)}
                      className="flex w-full justify-start gap-2 rounded-none"
                    >
                      <Eye className="h-4 w-4" />
                      View User
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => handleEdit(user)}
                      className="flex w-full justify-start gap-2 rounded-none"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit User
                    </Button>

                    <Button
                      variant="ghost"
                      disabled={updatingUserId === user.databaseId}
                      onClick={() => handleToggleStatus(user)}
                      className={
                        user.status === "Active"
                          ? "flex w-full justify-start gap-2 rounded-none text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                          : "flex w-full justify-start gap-2 rounded-none text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10"
                      }
                    >
                      <UserX className="h-4 w-4" />
                      {updatingUserId === user.databaseId
                        ? "Updating..."
                        : user.status === "Active"
                          ? "Disable Account"
                          : "Enable Account"}
                    </Button>
                  </Dropdown>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
              >
                {loadError
                  ? "Unable to display user records."
                  : "No users found."}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* View User Modal */}
      <Modal
        open={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setViewingUser(null);
        }}
        title="User Details"
        footer={
          <Button
            onClick={() => {
              setIsViewOpen(false);
              setViewingUser(null);
            }}
          >
            Close
          </Button>
        }
      >
        {viewingUser && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium uppercase text-zinc-500">
                User ID
              </p>
              <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                {viewingUser.id}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-zinc-500">
                Full Name
              </p>
              <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                {viewingUser.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-zinc-500">
                Email Address
              </p>
              <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                {viewingUser.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-zinc-500">
                Phone Number
              </p>
              <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                {viewingUser.phone || "Not provided"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase text-zinc-500">
                  Role
                </p>
                <div className="mt-2">
                  <Badge
                    variant={
                      viewingUser.role === "Employee"
                        ? "secondary"
                        : viewingUser.role === "Organizer"
                          ? "warning"
                          : "success"
                    }
                  >
                    {viewingUser.role}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-zinc-500">
                  Status
                </p>
                <div className="mt-2">
                  <Badge
                    variant={
                      viewingUser.status === "Active"
                        ? "success"
                        : "danger"
                    }
                  >
                    {viewingUser.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-zinc-500">
                Last Updated
              </p>
              <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                {viewingUser.lastUpdated}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={isEditOpen}
        onClose={closeEditModal}
        title="Edit User"
        footer={
          <>
            <Button
              variant="ghost"
              disabled={isSaving}
              onClick={closeEditModal}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="First Name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />

          <Input
            label="Last Name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Input
            label="Phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />

          <Select
            label="Role"
            value={selectedRole}
            onChange={(event) =>
              setSelectedRole(event.target.value as UserRole)
            }
            options={["Employee", "Organizer", "User"]}
          />

          {editError && (
            <p
              role="alert"
              className="text-sm text-red-500"
            >
              {editError}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
