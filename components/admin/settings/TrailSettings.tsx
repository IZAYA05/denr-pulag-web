export default function TrailSettings() {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Trail Settings
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Configure default trail behavior and maintenance preferences.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Default Trail Status
          </label>

          <select className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
            <option>Open</option>
            <option>Closed</option>
            <option>Maintenance</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Maximum Active Trails
          </label>

          <input
            type="number"
            defaultValue={3}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Maintenance Reminder (Days)
          </label>

          <input
            type="number"
            defaultValue={30}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4 dark:border-zinc-700">
          <div>
            <h4 className="font-medium text-zinc-900 dark:text-white">
              Allow Trail Maintenance Mode
            </h4>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Enable administrators to temporarily close trails for maintenance.
            </p>
          </div>

          <input
            type="checkbox"
            defaultChecked
            className="h-5 w-5 accent-emerald-600"
          />
        </div>
      </div>
    </div>
  );
}