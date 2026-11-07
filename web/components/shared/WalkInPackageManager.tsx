"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle, CheckCircle2, LoaderCircle, Package, Save } from "lucide-react";

type PackageService = {
  id: number;
  package_id: number;
  service: string;
};

type WalkInPackage = {
  id: number;
  organizer_id: number | null;
  is_walk_in: boolean;
  name: string;
  description: string;
  price: string | number;
  max_tourists: number;
  status: string;
  services: PackageService[];
};

type ApiResponse = {
  message?: string;
  package?: WalkInPackage | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

export default function WalkInPackageManager() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.user?.accessToken;

  const [packageRecord, setPackageRecord] =
    useState<WalkInPackage | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [maxTourists, setMaxTourists] = useState("12");
  const [services, setServices] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function populateForm(pkg: WalkInPackage) {
    setPackageRecord(pkg);
    setName(pkg.name);
    setDescription(pkg.description);
    setPrice(String(pkg.price));
    setMaxTourists(String(pkg.max_tourists));
    setServices(pkg.services.map((item) => item.service).join("\n"));
  }

  async function loadPackage() {
    if (!accessToken) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/staff/walk-in-package`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        },
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(data.message || "Unable to load the Walk-in Package.");
      }

      if (data.package) {
        populateForm(data.package);
      } else {
        setPackageRecord(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the Walk-in Package.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (!accessToken) {
      setError("Your session has expired. Please sign in again.");
      setLoading(false);
      return;
    }

    void loadPackage();
    // Load when the authenticated session becomes available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, sessionStatus]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!accessToken) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    const serviceList = Array.from(
      new Set(
        services
          .split(/\r?\n/)
          .map((service) => service.trim())
          .filter(Boolean),
      ),
    );

    if (serviceList.length === 0) {
      setError("Add at least one included service.");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      max_tourists: Number(maxTourists),
      services: serviceList,
    };

    if (!payload.name || !payload.description) {
      setError("Please complete the package name and description.");
      return;
    }

    if (!Number.isFinite(payload.price) || payload.price < 0) {
      setError("Enter a valid package price.");
      return;
    }

    if (
      !Number.isInteger(payload.max_tourists) ||
      payload.max_tourists < 1 ||
      payload.max_tourists > 12
    ) {
      setError("The maximum number of tourists must be between 1 and 12.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/staff/walk-in-package`,
        {
          method: packageRecord ? "PATCH" : "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(data.message || "Unable to save the Walk-in Package.");
      }

      if (!data.package) {
        throw new Error("The server did not return the saved package.");
      }

      populateForm(data.package);
      setSuccess(data.message || "Walk-in Package saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save the Walk-in Package.",
      );

      // Refresh after a possible duplicate-creation conflict.
      if (packageRecord === null) {
        await loadPackage();
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoaderCircle className="h-7 w-7 animate-spin text-emerald-700" />
        <span className="ml-3 text-sm text-zinc-500">
          Loading Walk-in Package...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <Package className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Walk-in Package
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage the shared package used for visitors who book in person.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
        Only one Walk-in Package is allowed. Admin and Employee accounts edit
        the same package. It is not displayed in the public online package
        catalog.
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {packageRecord ? "Edit package details" : "Create Walk-in Package"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {packageRecord
                ? `Package ID: ${packageRecord.id}`
                : "Set up the shared package for in-person visitors."}
            </p>
          </div>

          {packageRecord && (
            <span className="inline-flex w-fit items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {packageRecord.status}
            </span>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Package name
            </span>
            <input
              required
              maxLength={255}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Walk-in Mount Pulag Package"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description
            </span>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the walk-in package..."
              className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Price per tourist (PHP)
            </span>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Maximum tourists
            </span>
            <input
              required
              type="number"
              min="1"
              max="12"
              step="1"
              value={maxTourists}
              onChange={(event) => setMaxTourists(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">
              Maximum of 12 tourists per group.
            </span>
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Included services
            </span>
            <textarea
              required
              rows={5}
              value={services}
              onChange={(event) => setServices(event.target.value)}
              placeholder={"Environmental fee\nGuide service\nOther included services"}
              className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">
              Enter one service per line.
            </span>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {packageRecord
              ? "Changes affect the shared Walk-in Package."
              : "Creating this package will establish the one shared Walk-in Package."}
          </p>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving
              ? "Saving..."
              : packageRecord
                ? "Save changes"
                : "Create Walk-in Package"}
          </button>
        </div>
      </form>
    </div>
  );
}