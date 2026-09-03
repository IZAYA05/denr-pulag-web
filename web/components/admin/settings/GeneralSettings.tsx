import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

export default function GeneralSettings() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          General Settings
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Configure the organization's basic information.
        </p>
      </div>

      <div className="space-y-5">
        <Input
          label="Organization Name"
          type="text"
          defaultValue="Department of Environment and Natural Resources"
        />

        <Input
          label="Office"
          type="text"
          defaultValue="DENR – Bokod, Benguet"
        />

        <Select
          label="Timezone"
          defaultValue="UTC+8 (Philippines)"
        >
          <option>UTC+8 (Philippines)</option>
        </Select>

        <div className="pt-2">
          <Button type="button">
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
}