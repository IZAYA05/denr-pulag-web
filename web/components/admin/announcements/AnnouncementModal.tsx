"use client";

import { X } from "lucide-react";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

type AnnouncementModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
};

export default function AnnouncementModal({
  open,
  onClose,
  mode,
}: AnnouncementModalProps) {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}

      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}

      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {mode === "create"
                ? "New Announcement"
                : "Edit Announcement"}
            </h2>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {mode === "create"
                ? "Create an announcement for hikers and staff."
                : "Update the selected announcement."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}

        <div className="space-y-5 p-6">
          <Input
            label="Title"
            type="text"
            placeholder="Enter announcement title"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Content
            </label>

            <textarea
              rows={6}
              placeholder="Write the announcement..."
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          <Select
            label="Status"
            defaultValue="Published"
          >
            <option>Published</option>
            <option>Draft</option>
            <option>Scheduled</option>
          </Select>

          <Input
            label="Publish Date"
            type="date"
          />
        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t border-zinc-200 px-6 py-5 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button type="button" variant="primary">
            {mode === "create"
              ? "Publish Announcement"
              : "Save Changes"}
          </Button>
        </div>
      </div>
    </>
  );
}