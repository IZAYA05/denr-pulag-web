import UserRoleBadge from "../users/UserRoleBadge";
import UserStatusBadge from "../users/UserStatusBadge";

export default function AccountInformation() {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Account Information
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          View your account details and access information.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Username
          </label>

          <input
            type="text"
            value="isaiah.pili"
            readOnly
            className="w-full cursor-not-allowed rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email Address
          </label>

          <input
            type="email"
            value="admin@epulag.com"
            readOnly
            className="w-full cursor-not-allowed rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Employee ID
          </label>

          <input
            type="text"
            value="EMP-0001"
            readOnly
            className="w-full cursor-not-allowed rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          />
        </div>

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
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Account Created
            </label>

            <input
              type="text"
              value="January 15, 2026"
              readOnly
              className="w-full cursor-not-allowed rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Last Login
            </label>

            <input
              type="text"
              value="July 31, 2026 • 2:45 PM"
              readOnly
              className="w-full cursor-not-allowed rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}