import type { LucideIcon } from "lucide-react";

type UserProfileInfoRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  valueClassName?: string;
};

export default function UserProfileInfoRow({
  icon: Icon,
  label,
  value,
  valueClassName = "text-zinc-900 dark:text-white",
}: UserProfileInfoRowProps) {
  return (
    <div className="flex items-start gap-4 px-6 py-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
        <p className={`mt-1 break-words font-medium ${valueClassName}`}>
          {value}
        </p>
      </div>
    </div>
  );
}