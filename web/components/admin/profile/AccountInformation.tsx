import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

import UserRoleBadge from "../users/UserRoleBadge";
import UserStatusBadge from "../users/UserStatusBadge";

export default function AccountInformation() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Account Information
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          View your account details and access information.
        </p>
      </div>

      <div className="space-y-5">
        <Input
          label="Username"
          type="text"
          value="isaiah.pili"
          readOnly
          disabled
        />

        <Input
          label="Email Address"
          type="email"
          value="admin@epulag.com"
          readOnly
          disabled
        />

        <Input
          label="Employee ID"
          type="text"
          value="EMP-0001"
          readOnly
          disabled
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Role
            </label>

            <UserRoleBadge role="Administrator" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Account Status
            </label>

            <UserStatusBadge status="Active" />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Account Created"
            type="text"
            value="January 15, 2026"
            readOnly
            disabled
          />

          <Input
            label="Last Login"
            type="text"
            value="July 31, 2026 • 2:45 PM"
            readOnly
            disabled
          />
        </div>
      </div>
    </Card>
  );
}