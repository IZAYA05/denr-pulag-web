import { ShieldCheck } from "lucide-react";

export default function ProfileHeader() {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100 text-4xl font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          IP
        </div>

        <h1 className="mt-5 text-2xl font-bold text-zinc-900 dark:text-white">
          Isaiah Jonathan II C. Pili
        </h1>

        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">
          <ShieldCheck className="h-4 w-4" />
          Administrator
        </div>

        <p className="mt-3 text-zinc-500 dark:text-zinc-400">
          admin@epulag.com
        </p>
      </div>
    </div>
  );
}