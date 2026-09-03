"use client";

import { useState } from "react";

import UserFilters from "@/components/admin/users/UserFilters";
import UserStats from "@/components/admin/users/UserStats";
import UserTable from "@/components/admin/users/UserTable";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All Roles");
  const [status, setStatus] =
    useState("All Status");

  return (
    <div className="space-y-8">
      <UserStats />

      <UserFilters
        search={search}
        role={role}
        status={status}
        onSearchChange={setSearch}
        onRoleChange={setRole}
        onStatusChange={setStatus}
      />

      <UserTable
        search={search}
        role={role}
        status={status}
      />
    </div>
  );
}