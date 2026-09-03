import { Camera, Upload } from "lucide-react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AvatarUpload() {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-100 text-4xl font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            IP
          </div>

          <Button
            type="button"
            variant="primary"
            className="absolute bottom-1 right-1 h-10 w-10 rounded-full p-0 shadow-lg"
            title="Change profile photo"
          >
            <Camera className="h-5 w-5" />
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-6"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload New Photo
        </Button>

        <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
          JPG, PNG or WEBP
          <br />
          Maximum file size: 2 MB
        </p>
      </div>
    </Card>
  );
}