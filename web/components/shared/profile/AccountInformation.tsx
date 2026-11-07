import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useProfile } from "./ProfileContext";

export default function AccountInformation() {
  const { profile } = useProfile();

  const formatDate = (value: string | null) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const roleLabels: Record<string, string> = {
    ADMIN: "Administrator",
    EMPLOYEE: "Employee",
    ORGANIZER: "Organizer",
    USER: "User",
  };

  if (!profile) {
    return (
      <Card className="p-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading account information...
        </p>
      </Card>
    );
  }

  const isActive = profile.status?.toUpperCase() === "ACTIVE";

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
          label="Account ID"
          type="text"
          value={`EP-${String(profile.id).padStart(4, "0")}`}
          readOnly
          disabled
        />

        <Input
          label="Email Address"
          type="email"
          value={profile.email}
          readOnly
          disabled
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Role
            </label>

            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              {roleLabels[profile.role] || profile.role}
            </span>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Account Status
            </label>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                isActive
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
              }`}
            >
              {profile.status || "Unknown"}
            </span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Account Created"
            type="text"
            value={formatDate(profile.created_at)}
            readOnly
            disabled
          />

          <Input
            label="Last Profile Update"
            type="text"
            value={formatDate(profile.updated_at)}
            readOnly
            disabled
          />
        </div>
      </div>
    </Card>
  );
}
