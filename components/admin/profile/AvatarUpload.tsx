import { Camera, Upload } from "lucide-react";

export default function AvatarUpload() {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-100 text-4xl font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            IP
          </div>

          <button className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700">
            <Camera className="h-5 w-5" />
          </button>
        </div>

        <button className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-zinc-200 px-5 py-3 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          <Upload className="h-4 w-4" />
          Upload New Photo
        </button>

        <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
          JPG, PNG or WEBP
          <br />
          Maximum file size: 2 MB
        </p>
      </div>
    </div>
  );
}