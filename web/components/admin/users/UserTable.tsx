"use client";

import {
  Eye,
  Pencil,
  UserX,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useSession,
} from "next-auth/react";

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
  | "User";

export type UserStatus =
  | "Active"
  | "Inactive";

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
  lastLogin: string;
}

interface ApiUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
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

function formatRole(role: string): UserRole {
  switch (role) {
    case "ADMIN":
      return "Administrator";

    case "EMPLOYEE":
      return "Employee";

    case "USER":
      return "User";

    default:
      return "User";
  }
}

function formatApiRole(role: UserRole) {
  switch (role) {
    case "Administrator":
      return "ADMIN";

    case "Employee":
      return "EMPLOYEE";

    case "User":
      return "USER";
  }
}

export default function UserTable({
  search,
  role,
  status,
}: UserTableProps) {
  const {
    data: session,
  } = useSession();

  const [users, setUsers] =
    useState<User[]>([]);

  /*
  |--------------------------------------------------------------------------
  | View User State
  |--------------------------------------------------------------------------
  */

  const [
    viewingUser,
    setViewingUser,
  ] = useState<User | null>(null);

  const [
    isViewOpen,
    setIsViewOpen,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Edit User State
  |--------------------------------------------------------------------------
  */

  const [
    editingUser,
    setEditingUser,
  ] = useState<User | null>(null);

  const [
    isEditOpen,
    setIsEditOpen,
  ] = useState(false);

  const [
    firstName,
    setFirstName,
  ] = useState("");

  const [
    lastName,
    setLastName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    selectedRole,
    setSelectedRole,
  ] = useState<UserRole>("User");

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Fetch Users
  |--------------------------------------------------------------------------
  */

  async function fetchUsers() {
    if (!session?.user?.accessToken) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/users`,
        {
          headers: {
            Accept: "application/json",
            Authorization:
              `Bearer ${session.user.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to fetch users:",
          response.status
        );

        return;
      }

      const data =
        await response.json();

      const formattedUsers: User[] =
        data.users.map(
          (user: ApiUser) => ({
            id:
              `USR-${String(
                user.id
              ).padStart(
                3,
                "0"
              )}`,

            databaseId:
              user.id,

            firstName:
              user.first_name,

            lastName:
              user.last_name,

            name:
              `${user.first_name} ${user.last_name}`,

            email:
              user.email,

            phone:
              user.phone,

            role:
              formatRole(
                user.role
              ),

            status:
              user.status ===
              "INACTIVE"
                ? "Inactive"
                : "Active",

            lastLogin:
              new Date(
                user.updated_at
              ).toLocaleDateString(
                "en-US",
                {
                  month:
                    "short",

                  day:
                    "numeric",

                  year:
                    "numeric",
                }
              ),
          })
        );

      setUsers(
        formattedUsers
      );
    } catch (error) {
      console.error(
        "Unable to fetch users:",
        error
      );
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [session]);

  /*
  |--------------------------------------------------------------------------
  | View User
  |--------------------------------------------------------------------------
  */

  function handleView(
    user: User
  ) {
    setViewingUser(
      user
    );

    setIsViewOpen(
      true
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Open Edit Modal
  |--------------------------------------------------------------------------
  */

  function handleEdit(
    user: User
  ) {
    setEditingUser(
      user
    );

    setFirstName(
      user.firstName
    );

    setLastName(
      user.lastName
    );

    setEmail(
      user.email
    );

    setPhone(
      user.phone
    );

    setSelectedRole(
      user.role
    );

    setError("");

    setIsEditOpen(
      true
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Save Changes
  |--------------------------------------------------------------------------
  */

  async function handleSaveChanges() {
    if (!editingUser) {
      return;
    }

    if (
      !session?.user
        ?.accessToken
    ) {
      setError(
        "You are not authenticated."
      );

      return;
    }

    setIsSaving(
      true
    );

    setError("");

    try {
      const response =
        await fetch(
          `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/users/${editingUser.databaseId}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",

              Authorization:
                `Bearer ${session.user.accessToken}`,
            },

            body:
              JSON.stringify({
                first_name:
                  firstName,

                last_name:
                  lastName,

                email,

                phone,

                role:
                  formatApiRole(
                    selectedRole
                  ),
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to update user."
        );

        return;
      }

      await fetchUsers();

      setIsEditOpen(
        false
      );

      setEditingUser(
        null
      );
    } catch (error) {
      console.error(
        "Unable to update user:",
        error
      );

      setError(
        "Something went wrong while updating the user."
      );
    } finally {
      setIsSaving(
        false
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Enable / Disable Account
  |--------------------------------------------------------------------------
  */

  async function handleToggleStatus(
    user: User
  ) {
    if (
      !session?.user
        ?.accessToken
    ) {
      alert(
        "You are not authenticated."
      );

      return;
    }

    try {
      const response =
        await fetch(
          `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/users/${user.databaseId}/status`,
          {
            method:
              "PATCH",

            headers: {
              Accept:
                "application/json",

              Authorization:
                `Bearer ${session.user.accessToken}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to update account status."
        );

        return;
      }

      await fetchUsers();
    } catch (error) {
      console.error(
        "Unable to update account status:",
        error
      );

      alert(
        "Something went wrong while updating the account."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Filter Users
  |--------------------------------------------------------------------------
  */

  const filteredUsers =
    users.filter(
      (user) => {
        const matchesSearch =
          user.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          user.email
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesRole =
          role ===
            "All Roles" ||
          user.role ===
            role;

        const matchesStatus =
          status ===
            "All Status" ||
          user.status ===
            status;

        return (
          matchesSearch &&
          matchesRole &&
          matchesStatus
        );
      }
    );

  return (
    <>
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
              Last Login
            </th>

            <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.length >
          0 ? (
            filteredUsers.map(
              (user) => (
                <tr
                  key={
                    user.id
                  }
                  className="border-b border-zinc-100 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white">
                        {
                          user.name
                        }
                      </p>

                      <p className="text-xs text-zinc-500">
                        {
                          user.id
                        }
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                    {
                      user.email
                    }
                  </td>

                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        user.role ===
                        "Administrator"
                          ? "info"
                          : user.role ===
                            "Employee"
                          ? "secondary"
                          : "success"
                      }
                    >
                      {
                        user.role
                      }
                    </Badge>
                  </td>

                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        user.status ===
                        "Active"
                          ? "success"
                          : "danger"
                      }
                    >
                      {
                        user.status
                      }
                    </Badge>
                  </td>

                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                    {
                      user.lastLogin
                    }
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Dropdown>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          handleView(
                            user
                          )
                        }
                        className="flex w-full justify-start gap-2 rounded-none"
                      >
                        <Eye className="h-4 w-4" />

                        View User
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() =>
                          handleEdit(
                            user
                          )
                        }
                        className="flex w-full justify-start gap-2 rounded-none"
                      >
                        <Pencil className="h-4 w-4" />

                        Edit User
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() =>
                          handleToggleStatus(
                            user
                          )
                        }
                        className={
                          user.status ===
                          "Active"
                            ? "flex w-full justify-start gap-2 rounded-none text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                            : "flex w-full justify-start gap-2 rounded-none text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10"
                        }
                      >
                        <UserX className="h-4 w-4" />

                        {user.status ===
                        "Active"
                          ? "Disable Account"
                          : "Enable Account"}
                      </Button>
                    </Dropdown>
                  </td>
                </tr>
              )
            )
          ) : (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
              >
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* View User Modal */}

      <Modal
        open={
          isViewOpen
        }
        onClose={() => {
          setIsViewOpen(
            false
          );

          setViewingUser(
            null
          );
        }}
        title="User Details"
        footer={
          <Button
            onClick={() => {
              setIsViewOpen(
                false
              );

              setViewingUser(
                null
              );
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
                {
                  viewingUser.id
                }
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-zinc-500">
                Full Name
              </p>

              <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                {
                  viewingUser.name
                }
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-zinc-500">
                Email Address
              </p>

              <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                {
                  viewingUser.email
                }
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-zinc-500">
                Phone Number
              </p>

              <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                {
                  viewingUser.phone
                }
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
                      viewingUser.role ===
                      "Administrator"
                        ? "info"
                        : viewingUser.role ===
                          "Employee"
                        ? "secondary"
                        : "success"
                    }
                  >
                    {
                      viewingUser.role
                    }
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
                      viewingUser.status ===
                      "Active"
                        ? "success"
                        : "danger"
                    }
                  >
                    {
                      viewingUser.status
                    }
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-zinc-500">
                Last Updated
              </p>

              <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                {
                  viewingUser.lastLogin
                }
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}

      <Modal
        open={
          isEditOpen
        }
        onClose={() => {
          setIsEditOpen(
            false
          );

          setEditingUser(
            null
          );

          setError("");
        }}
        title="Edit User"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditOpen(
                  false
                );

                setEditingUser(
                  null
                );

                setError(
                  ""
                );
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={
                handleSaveChanges
              }
              disabled={
                isSaving
              }
            >
              {isSaving
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="First Name"
            value={
              firstName
            }
            onChange={(
              event
            ) =>
              setFirstName(
                event.target
                  .value
              )
            }
          />

          <Input
            label="Last Name"
            value={
              lastName
            }
            onChange={(
              event
            ) =>
              setLastName(
                event.target
                  .value
              )
            }
          />

          <Input
            label="Email"
            type="email"
            value={
              email
            }
            onChange={(
              event
            ) =>
              setEmail(
                event.target
                  .value
              )
            }
          />

          <Input
            label="Phone"
            value={
              phone
            }
            onChange={(
              event
            ) =>
              setPhone(
                event.target
                  .value
              )
            }
          />

          <Select
            label="Role"
            value={
              selectedRole
            }
            onChange={(
              event
            ) =>
              setSelectedRole(
                event.target
                  .value as UserRole
              )
            }
            options={[
              "Administrator",
              "Employee",
              "User",
            ]}
          />

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}