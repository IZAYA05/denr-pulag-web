import Card from "@/components/ui/Card";

const organizationDetails = [
  {
    label: "Organization",
    value: "Department of Environment and Natural Resources",
  },
  {
    label: "Office",
    value: "DENR-Bokod, Benguet",
  },
  {
    label: "System",
    value: "E-PULAG",
  },
  {
    label: "Timezone",
    value: "Philippine Standard Time (UTC+8)",
  },
];

export default function GeneralSettings() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          General Information
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Organization and system information.
        </p>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {organizationDetails.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {item.label}
            </p>

            <p className="text-sm font-semibold text-zinc-900 dark:text-white sm:text-right">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-5 rounded-xl bg-zinc-50 p-4 text-xs leading-5 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
        These details are currently defined by the system. They cannot be
        edited from this page.
      </p>
    </Card>
  );
}
