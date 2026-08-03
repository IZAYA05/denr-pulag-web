import UserFilters from "@/components/admin/users/UserFilters";
import UserStats from "@/components/admin/users/UserStats";
import UserTable from "@/components/admin/users/UserTable";

export default function UsersPage() {
  return (
    <div className="space-y-8">
      <UserStats />

      <UserFilters />

      <UserTable />
    </div>
  );
}