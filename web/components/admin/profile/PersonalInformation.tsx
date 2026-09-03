import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

export default function PersonalInformation() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Personal Information
        </h3>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Update your personal details.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="First Name"
          type="text"
          defaultValue="Isaiah Jonathan II"
        />

        <Input
          label="Last Name"
          type="text"
          defaultValue="Pili"
        />

        <Input
          label="Middle Name"
          type="text"
          placeholder="Optional"
        />

        <Input
          label="Suffix"
          type="text"
          defaultValue="II"
        />

        <Input
          label="Contact Number"
          type="tel"
          placeholder="+63 9XX XXX XXXX"
        />

        <Input
          label="Office / Department"
          type="text"
          defaultValue="DENR - Bokod"
        />
      </div>
    </Card>
  );
}