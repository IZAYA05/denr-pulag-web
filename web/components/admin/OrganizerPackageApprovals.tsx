"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Package as PackageIcon,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { useDashboard } from "@/components/admin/DashboardClient";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type PackageService = {
  id: number;
  service: string;
};

type OrganizerPackage = {
  id: number;
  name: string;
  description: string;
  price: string | number;
  max_tourists: number;
  status: string;
  approval_status: string;
  approval_notes?: string | null;
  created_at: string;
  organizer?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  services?: PackageService[];
};

type ApiResponse = {
  packages?: OrganizerPackage[];
  message?: string;
  errors?: Record<string, string | string[]>;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

function getMessage(data: ApiResponse, fallback: string) {
  const firstError = Object.values(data.errors ?? {})
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .find((value): value is string => typeof value === "string");

  return firstError || data.message || fallback;
}

function formatPrice(value: string | number) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Price unavailable";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function OrganizerPackageApprovals() {
  const { accessToken } = useDashboard();
  const [packages, setPackages] = useState<OrganizerPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  const loadPackages = useCallback(async () => {
    if (!accessToken) {
      setPackages([]);
      setLoading(false);
      setError("Your session is missing an API access token. Please sign in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/organizer-packages?approval_status=PENDING`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        }
      );
      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(getMessage(data, "Unable to load package submissions."));
      }

      setPackages(Array.isArray(data.packages) ? data.packages : []);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load package submissions."
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void Promise.resolve().then(loadPackages);
  }, [loadPackages]);

  async function reviewPackage(
    packageItem: OrganizerPackage,
    decision: "APPROVED" | "REJECTED"
  ) {
    if (!accessToken) return;

    setProcessingId(packageItem.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/organizer-packages/${packageItem.id}/review`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            decision,
            approval_notes: notes[packageItem.id]?.trim() || null,
          }),
        }
      );
      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(getMessage(data, "Unable to process this package."));
      }

      setPackages((current) => current.filter((item) => item.id !== packageItem.id));
      setNotes((current) => {
        const next = { ...current };
        delete next[packageItem.id];
        return next;
      });
      setSuccess(
        decision === "APPROVED"
          ? `“${packageItem.name}” was approved and can now appear in the public catalog.`
          : `“${packageItem.name}” was rejected. The organizer will receive your feedback.`
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to process this package."
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-6 w-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Package Approvals
            </h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            Review organizer-submitted packages before they become visible in the public package catalog.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadPackages()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          {success}
        </div>
      )}

      <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
        <Clock3 className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            {packages.length} package{packages.length === 1 ? "" : "s"} awaiting review
          </p>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Only approved and active packages are shown to visitors.
          </p>
        </div>
      </div>

      {loading ? (
        <Card className="p-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Loading package submissions...
        </Card>
      ) : packages.length === 0 ? (
        <Card className="flex flex-col items-center p-12 text-center">
          <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">
            No pending package submissions
          </h3>
          <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
            New packages submitted by organizers will appear here for DENR review.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {packages.map((packageItem) => {
            const organizerName = [
              packageItem.organizer?.first_name,
              packageItem.organizer?.last_name,
            ].filter(Boolean).join(" ") || "Organizer unavailable";

            return (
              <Card key={packageItem.id} className="overflow-hidden p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-400">
                      <PackageIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-bold text-zinc-900 dark:text-white">
                        {packageItem.name}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Submitted by {organizerName}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {packageItem.organizer?.email || "No organizer email"}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                    Pending review
                  </span>
                </div>

                <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {packageItem.description}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Package price</p>
                    <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                      {formatPrice(packageItem.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Maximum tourists</p>
                    <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                      {packageItem.max_tourists} (maximum allowed: 12)
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Included services
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(packageItem.services || []).length > 0 ? packageItem.services?.map((service) => (
                      <span key={service.id} className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                        {service.service}
                      </span>
                    )) : (
                      <span className="text-sm text-zinc-500">No services listed.</span>
                    )}
                  </div>
                </div>

                <label className="mt-5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  DENR review notes <span className="font-normal text-zinc-400">(required when rejecting)</span>
                  <textarea
                    value={notes[packageItem.id] || ""}
                    onChange={(event) => setNotes((current) => ({ ...current, [packageItem.id]: event.target.value }))}
                    rows={3}
                    maxLength={2000}
                    placeholder="Add feedback or corrections requested from the organizer..."
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  />
                </label>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="danger"
                    disabled={processingId === packageItem.id || !notes[packageItem.id]?.trim()}
                    onClick={() => void reviewPackage(packageItem, "REJECTED")}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    type="button"
                    disabled={processingId === packageItem.id}
                    onClick={() => void reviewPackage(packageItem, "APPROVED")}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {processingId === packageItem.id ? "Processing..." : "Approve package"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
