
"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

import type { OrganizerPackage, PackageFormData } from "./PackageContext";

const SERVICE_OPTIONS = [
  "DENR Registration",
  "Transportation",
  "Guide / Tour",
  "Accommodation",
  "Food",
  "Other Services",
];

type PackageFormModalProps = {
  open: boolean;
  packageItem: OrganizerPackage | null;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSave: (data: PackageFormData) => Promise<boolean>;
};

export default function PackageFormModal({
  open,
  packageItem,
  saving,
  error,
  onClose,
  onSave,
}: PackageFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [maxTourists, setMaxTourists] = useState("12");
  const [services, setServices] = useState<string[]>([]);

  const isEditing = Boolean(packageItem);

  useEffect(() => {
    if (!open) return;

    if (packageItem) {
      setName(packageItem.name);
      setDescription(packageItem.description);
      setPrice(String(packageItem.price));
      setMaxTourists(String(packageItem.maxTourists));
      setServices(packageItem.services);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setMaxTourists("12");
      setServices([]);
    }
  }, [open, packageItem]);

  const toggleService = (service: string) => {
    setServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const numericPrice = Number(price);
    const numericCapacity = Number(maxTourists);

    if (!trimmedName || !trimmedDescription) return;

    if (price.trim() === "" || !Number.isFinite(numericPrice) || numericPrice < 0) {
      return;
    }

    if (
      maxTourists.trim() === "" ||
      !Number.isInteger(numericCapacity) ||
      numericCapacity < 1 ||
      numericCapacity > 12
    ) {
      return;
    }

    if (services.length === 0) return;

    await onSave({
      name: trimmedName,
      description: trimmedDescription,
      price: numericPrice,
      maxTourists: numericCapacity,
      services,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Package" : "Create Package"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="package-name"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Package Name
          </label>
          <Input
            id="package-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Pulag Weekend Adventure"
            disabled={saving}
            required
          />
        </div>

        <div>
          <label
            htmlFor="package-description"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Description
          </label>
          <textarea
            id="package-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what your package offers..."
            disabled={saving}
            rows={4}
            required
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div>
          <label
            htmlFor="package-price"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Price per Tourist (₱)
          </label>
          <Input
            id="package-price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="0.00"
            disabled={saving}
            required
          />
        </div>

        <div>
          <label
            htmlFor="package-capacity"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Tourist Capacity
          </label>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                id="package-capacity"
                type="number"
                min="1"
                max="12"
                step="1"
                value={maxTourists}
                onChange={(event) => setMaxTourists(event.target.value)}
                disabled={saving}
                required
              />
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              <Users className="h-4 w-4" />
              <span>1–12</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Set the maximum number of tourists allowed in one booking.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Included Services
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {SERVICE_OPTIONS.map((service) => {
              const selected = services.includes(service);

              return (
                <label
                  key={service}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                    selected
                      ? "border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/20"
                      : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleService(service)}
                    disabled={saving}
                    className="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {service}
                  </span>
                </label>
              );
            })}
          </div>
          {services.length === 0 && (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Select at least one service.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Create Package"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
