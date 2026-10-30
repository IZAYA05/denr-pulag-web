import { Mail, ShieldCheck, UserRound } from "lucide-react";
import UserProfileInfoRow from "./UserProfileInfoRow";

export default function UserProfileCard({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Personal Information
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Your account details currently available in E-PULAG.
        </p>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        <UserProfileInfoRow icon={UserRound} label="Full Name" value={name} />
        <UserProfileInfoRow icon={Mail} label="Email Address" value={email} />
        <UserProfileInfoRow
          icon={ShieldCheck}
          label="Account Status"
          value="Signed In"
          valueClassName="text-emerald-700 dark:text-emerald-400"
        />
      </div>
    </section>
  );
}