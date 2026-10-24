"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Package as PackageIcon,
  Trash2,
  X,
} from "lucide-react";

import Button from "@/components/ui/Button";

import PackageCard from "./PackageCard";
import PackageFormModal from "./PackageFormModal";
import PackageViewModal from "./PackageViewModal";
import { usePackages } from "./PackageContext";
import type { OrganizerPackage } from "./PackageContext";

export default function PackageList() {
  const {
    filteredPackages,
    loading,
    saving,
    togglingId,
    deletingId,
    error,
    isFormOpen,
    isViewOpen,
    editingPackage,
    viewingPackage,
    openCreate,
    openEdit,
    openView,
    closeForm,
    closeView,
    savePackage,
    toggleStatus,
    deletePackage,
  } = usePackages();

  const [pendingDelete, setPendingDelete] =
    useState<OrganizerPackage | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastKey, setToastKey] = useState(0);

  useEffect(() => {
    // Keep form errors inside the form modal.
    // Display other package errors as bottom-right notifications.
    if (error && !isFormOpen) {
      setToastMessage(error);
      setToastKey((current) => current + 1);
    }
  }, [error, isFormOpen]);

  useEffect(() => {
    if (!toastMessage) return;

    const timeout = window.setTimeout(() => {
      setToastMessage("");
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [toastKey, toastMessage]);

  const confirmDelete = async () => {
    if (!pendingDelete || deletingId !== null) return;

    const selectedPackage = pendingDelete;

    await deletePackage(selectedPackage);
    setPendingDelete(null);
  };

  if (loading) {
    return (
      <section className="rounded-3xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-amber-500 dark:border-zinc-700 dark:border-t-amber-400" />

        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Loading packages...
        </p>
      </section>
    );
  }

  return (
    <>
      {filteredPackages.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPackages.map((packageItem) => (
            <PackageCard
              key={packageItem.id}
              packageItem={packageItem}
              togglingId={togglingId}
              deletingId={deletingId}
              onView={openView}
              onEdit={openEdit}
              onToggleStatus={toggleStatus}
              onDelete={setPendingDelete}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <PackageIcon className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />

          <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No packages found
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Create your first package to start offering travel services to
            tourists, or adjust your search and status filters.
          </p>

          <Button className="mt-6" onClick={openCreate}>
            Create Package
          </Button>
        </section>
      )}

      <PackageFormModal
        open={isFormOpen}
        packageItem={editingPackage}
        saving={saving}
        error={error}
        onClose={closeForm}
        onSave={savePackage}
      />

      <PackageViewModal
        open={isViewOpen}
        packageItem={viewingPackage}
        onClose={closeView}
      />

      {/* In-app delete confirmation modal */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              deletingId !== pendingDelete.id
            ) {
              setPendingDelete(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-package-title"
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                <Trash2 className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h2
                  id="delete-package-title"
                  className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  Delete package?
                </h2>

                <p className="mt-2 break-words text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  You are about to delete{" "}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {pendingDelete.name}
                  </span>
                  . This action cannot be undone.
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  Packages with existing booking records cannot be deleted.
                  Deactivate those packages instead.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close delete confirmation"
                className="rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
                onClick={() => setPendingDelete(null)}
                disabled={deletingId === pendingDelete.id}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setPendingDelete(null)}
                disabled={deletingId === pendingDelete.id}
              >
                Keep Package
              </Button>

              <Button
                variant="danger"
                onClick={() => void confirmDelete()}
                disabled={deletingId === pendingDelete.id}
              >
                <Trash2 className="mr-2 h-4 w-4" />

                {deletingId === pendingDelete.id
                  ? "Deleting..."
                  : "Delete Package"}
              </Button>
            </div>
          </section>
        </div>
      )}

      {/* Bottom-right red error toast */}
      {toastMessage && (
        <div
          key={toastKey}
          role="alert"
          aria-live="assertive"
          className="fixed bottom-5 right-5 z-[120] flex w-[calc(100%-2.5rem)] max-w-sm items-start gap-3 rounded-xl border border-red-200 bg-white p-4 text-red-800 shadow-xl dark:border-red-900 dark:bg-zinc-950 dark:text-red-300"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

          <p className="min-w-0 flex-1 text-sm leading-5">
            {toastMessage}
          </p>

          <button
            type="button"
            aria-label="Dismiss notification"
            className="rounded-md p-1 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/50"
            onClick={() => setToastMessage("")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}