import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export default function TrailSettings() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Trail Settings
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Configure default trail behavior and maintenance preferences.
        </p>
      </div>

      <div className="space-y-5">
        <Select
          label="Default Trail Status"
          defaultValue="Open"
        >
          <option>Open</option>
          <option>Closed</option>
          <option>Maintenance</option>
        </Select>

        <Input
          label="Maximum Active Trails"
          type="number"
          defaultValue={3}
        />

        <Input
          label="Maintenance Reminder (Days)"
          type="number"
          defaultValue={30}
        />

        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4 dark:border-zinc-700">
          <div>
            <h4 className="font-medium text-zinc-900 dark:text-white">
              Allow Trail Maintenance Mode
            </h4>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Enable administrators to temporarily close trails for
              maintenance.
            </p>
          </div>

          <input
            type="checkbox"
            defaultChecked
            className="h-5 w-5 accent-emerald-600"
          />
        </div>
      </div>
    </Card>
  );
}