"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, ExternalLink } from "lucide-react";

type MessagesLauncherProps = {
  href: string;
  destinationHref: string;
};

export default function MessagesLauncher({
  href,
  destinationHref,
}: MessagesLauncherProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        aria-label="Open messages"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Messages"
        onClick={() => setOpen((value) => !value)}
        className={`flex h-10 w-10 items-center justify-center rounded-full border transition focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
          open
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/40"
        }`}
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Messages"
          className="fixed inset-x-2 bottom-2 top-[76px] z-[100] flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-950/20 dark:border-zinc-700 dark:bg-zinc-950 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:h-[min(760px,calc(100vh-6rem))] sm:w-[min(900px,calc(100vw-2rem))]"
        >
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Messages
              </h2>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={destinationHref}
                aria-label="Open Messages page"
                title="Open Messages page"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-emerald-700 dark:hover:bg-zinc-800 dark:hover:text-emerald-300"
              >
                <ExternalLink className="h-4 w-4" />
              </a>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close messages"
                title="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <iframe
            title="Messages"
            src={href}
            className="min-h-0 w-full flex-1 border-0 bg-white dark:bg-zinc-950"
          />
        </section>
      )}
    </div>
  );
}
