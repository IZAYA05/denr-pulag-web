"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  CheckCircle2,
  Compass,
  PackageSearch,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

type ApiPackageService = {
  id: number;
  package_id: number;
  service: string;
};

type ApiPackage = {
  id: number;
  name: string;
  description: string;
  price: string | number;
  max_tourists: number;
  status: string;
  services: ApiPackageService[];
};

type PackageItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  maxTourists: number;
  services: string[];
};

type ApiError = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

function getErrorMessage(
  data: ApiError,
): string {
  if (data.errors) {
    const firstError = Object.values(data.errors)
      .flatMap((value) =>
        Array.isArray(value) ? value : [value],
      )
      .find((value) => typeof value === "string");

    if (firstError) {
      return firstError;
    }
  }

  return (
    data.message ||
    "Unable to load packages. Please try again."
  );
}

async function readResponse(
  response: Response,
): Promise<Record<string, unknown>> {
  const text = await response.text();

  if (!text.trim()) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(text);

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<string, unknown>;
    }

    return {};
  } catch {
    throw new Error(
      "The server returned an unreadable response.",
    );
  }
}

function formatPrice(price: number): string {
  if (!Number.isFinite(price)) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export default function BrowsePackages() {
  const router = useRouter();
  const { data: session, status: sessionStatus } =
    useSession();

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_LARAVEL_API_URL ||
    "http://localhost:8000";

  const accessToken = session?.user?.accessToken;

  useEffect(() => {
    if (sessionStatus === "loading") {
      setLoading(true);
      return;
    }

    if (!accessToken) {
      setPackages([]);
      setError("");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPackages() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/packages`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
          },
        );

        const data = await readResponse(response);

        if (!response.ok) {
          throw new Error(
            getErrorMessage(data as ApiError),
          );
        }

        const apiPackages = Array.isArray(data.packages)
          ? (data.packages as ApiPackage[])
          : [];

        const activePackages = apiPackages
          .filter(
            (item) =>
              typeof item.status === "string" &&
              item.status.toUpperCase() === "ACTIVE",
          )
          .map((item): PackageItem => ({
            id: item.id,
            name: item.name,
            description: item.description || "",
            price: Number(item.price),
            maxTourists: Number(item.max_tourists),
            services: Array.isArray(item.services)
              ? item.services.map(
                  (service: ApiPackageService) =>
                    service.service,
                )
              : [],
          }));

        if (!cancelled) {
          setPackages(activePackages);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load packages. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPackages();

    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    apiBaseUrl,
    retryCount,
    sessionStatus,
  ]);

  const filteredPackages = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return packages;
    }

    return packages.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.services.some((service) =>
          service.toLowerCase().includes(query),
        )
      );
    });
  }, [packages, search]);

  if (sessionStatus === "loading") {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Checking your session...
        </div>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated" || !accessToken) {
    return (
      <section className="rounded-3xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <AlertCircle className="mx-auto h-9 w-9 text-amber-500" />
        <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
          Sign in required
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Please sign in to browse available Mount Pulag packages.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-emerald-950 px-6 py-9 text-white sm:px-9 sm:py-12">
        <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 h-48 w-48 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-100">
            <Compass className="h-4 w-4" />
            Explore Mount Pulag
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Browse Packages
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-100/80 sm:text-base">
            Explore hiking packages, compare included services,
            and book a trip to Mount Pulag.
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Available Packages
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {loading
                ? "Loading available packages..."
                : `${filteredPackages.length} ${
                    filteredPackages.length === 1
                      ? "package"
                      : "packages"
                  } found`}
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search packages or services..."
              aria-label="Search packages or services"
              className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-red-900/60 dark:bg-red-950/30"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300">
                  Could not load packages
                </p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              disabled={loading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="h-5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="mt-4 h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="mt-2 h-3 w-4/5 rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="mt-8 h-8 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="mt-6 h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : !error && filteredPackages.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <PackageSearch className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
              {packages.length === 0
                ? "No packages available"
                : "No matching packages"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {packages.length === 0
                ? "There are currently no active packages to display. Please check again later."
                : "Try another search term or clear your search."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPackages.map((item) => (
              <article
                key={item.id}
                className="flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="border-b border-zinc-100 p-6 dark:border-zinc-800">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold leading-6 text-zinc-900 dark:text-white">
                      {item.name}
                    </h3>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Active
                    </span>
                  </div>

                  <p className="mt-3 min-h-12 whitespace-pre-line text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                    {item.description || "No description provided."}
                  </p>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Package Price / Person
                      </p>
                      <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <Users className="h-4 w-4 shrink-0" />
                      <span>Up to {Math.min(12, item.maxTourists)}</span>
                    </div>
                  </div>

                  <div className="mt-7 flex-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Included Services
                    </h4>

                    {item.services.length > 0 ? (
                      <ul className="mt-3 space-y-2">
                        {item.services.map((service, index) => (
                          <li
                            key={`${item.id}-${service}-${index}`}
                            className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            <span>{service}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                        No services listed.
                      </p>
                    )}
                  </div>

                  <div className="mt-7 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                      Package price is shown per person. Review the
                      included services and entrance-fee arrangements
                      before booking.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/user/book?packageId=${item.id}`)
                      }
                      className="mt-4 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                    >
                      Book Package
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
