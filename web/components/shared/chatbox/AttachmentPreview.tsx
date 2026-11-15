"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, FileImage, LoaderCircle } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

type AttachmentPreviewProps = {
  attachment: {
    id: number;
    document_type?: string | null;
    original_name: string;
    mime_type: string;
    file_size: number;
  };
  accessToken: string;
};

function formatSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "File";
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentPreview({
  attachment,
  accessToken,
}: AttachmentPreviewProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    async function loadAttachment() {
      try {
        const response = await fetch(
          `${API_URL}/api/message-attachments/${attachment.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: attachment.mime_type,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load this attachment.");
        }

        const blob = await response.blob();
        createdUrl = URL.createObjectURL(blob);
        if (active) setObjectUrl(createdUrl);
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Unable to load this attachment.");
        }
      }
    }

    void loadAttachment();

    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [accessToken, attachment.id, attachment.mime_type]);

  const isImage = attachment.mime_type.startsWith("image/");

  return (
    <div className="mt-2 max-w-xs rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        <FileImage className="h-4 w-4 shrink-0 text-emerald-600" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
            {attachment.document_type?.replaceAll("_", " ") || "Attachment"}
          </p>
          <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
            {attachment.original_name} · {formatSize(attachment.file_size)}
          </p>
        </div>
        {objectUrl && (
          <a
            href={objectUrl}
            download={attachment.original_name}
            aria-label={`Download ${attachment.original_name}`}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-emerald-700 dark:hover:bg-zinc-800 dark:hover:text-emerald-400"
          >
            <Download className="h-4 w-4" />
          </a>
        )}
      </div>

      {isImage && objectUrl && (
        <a href={objectUrl} target="_blank" rel="noreferrer" className="mt-2 block">
          {/* Private authenticated document preview loaded as a temporary object URL. */}
          <Image
            src={objectUrl}
            alt={attachment.document_type?.replaceAll("_", " ") || attachment.original_name}
            width={600}
            height={400}
            unoptimized
            className="max-h-52 w-full rounded-lg object-contain"
          />
        </a>
      )}
      {!objectUrl && !error && (
        <p className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Loading attachment...
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
