"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Compass,
  Mountain,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

type ApiService = {
  id: number;
  package_id: number;
  service: string;
};

type ApiPackage = {
  id: number;
  organizer_id: number;
  name: string;
  description: string | null;
  price: string | number;
  max_tourists: number;
  status: string;
  services: ApiService[];
};

type ApiError = {
  message?: string;
};

type Props = {
  onSelectPackage?: (pkg: ApiPackage) => void;
};

function formatPrice(price: string | number) {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return "Price unavailable";
  }

  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function BrowsePackages({ onSelectPackage }: Props) {
  const [packages, setPackages] = useState<ApiPackage[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPackages() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/packages`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          (data as ApiError).message || "Unable to load packages.",
        );
      }

      const apiPackages = Array.isArray(data.packages)
        ? (data.packages as ApiPackage[])
        : [];

      setPackages(
        apiPackages.filter(
          (item) => item.status.toUpperCase() === "ACTIVE",
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch packages.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPackages();
  }, []);

  const filteredPackages = packages.filter((pkg) => {
    const query = search.trim().toLowerCase();

    return (
      pkg.name.toLowerCase().includes(query) ||
      (pkg.description || "").toLowerCase().includes(query) ||
      pkg.services.some((service) =>
        service.service.toLowerCase().includes(query),
      )
    );
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 sm:space-y-10">
      {/* Mount Pulag Hero */}
      <section
        className="relative isolate overflow-hidden rounded-3xl bg-emerald-950 bg-cover bg-center text-white shadow-xl shadow-emerald-950/10"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(2, 35, 28, 0.78), rgba(2, 35, 28, 0.25)), url('/mount-pulag-sea-of-clouds.jpg')",
        }}
      >
        <div className="grid min-h-[320px] gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:min-h-[380px] lg:grid-cols-[1fr_auto] lg:items-center lg:px-10 lg:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">
              <Compass className="h-4 w-4" />
              YOUR MOUNT PULAG JOURNEY
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Find your next
              <span className="mt-1 block text-emerald-300">
                mountain adventure.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white sm:text-base sm:leading-7">
              Explore available hiking packages, compare included
              services, and choose the package that fits your trip
              to Mount Pulag.
            </p>

            <a
              href="#available-packages"
              style={{
                backgroundColor: "#ffffff",
                color: "#022c22",
              }}
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-950"
            >
              <span style={{ color: "#022c22" }}>Explore packages</span>
              <ArrowRight
                className="h-4 w-4"
                style={{ color: "#022c22" }}
              />
            </a>
          </div>

          <div className="hidden lg:flex lg:items-center lg:justify-center">
            <div className="flex h-36 w-36 items-center justify-center rounded-full border border-white/25 bg-black/15 backdrop-blur-sm">
              <Mountain
                className="h-16 w-16 text-emerald-100"
                strokeWidth={1.3}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Mount Pulag Photo */}
      <section className="relative isolate overflow-hidden rounded-3xl bg-zinc-900">
        <img
          src="/near-saddle-camp.jpg"
          alt="Sunrise above the clouds near Mount Pulag's Saddle Camp"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />

        <div className="min-h-[220px] bg-gradient-to-r from-black/75 via-black/40 to-transparent px-6 py-8 sm:min-h-[260px] sm:px-10 sm:py-10">
          <div className="flex min-h-[150px] max-w-xl flex-col justify-center sm:min-h-[180px]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              Experience the highlands
            </p>

            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              A sunrise worth the journey.
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/90 sm:text-base">
              Discover the beauty of Mount Pulag and explore the
              available packages for your next hiking adventure.
            </p>
          </div>
        </div>
      </section>

      {/* Available Packages */}
      <section
        id="available-packages"
        className="scroll-mt-24 space-y-5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
              Discover your options
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              Available packages
            </h2>

            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {loading
                ? "Finding available packages..."
                : `${filteredPackages.length} ${
                    filteredPackages.length === 1
                      ? "package"
                      : "packages"
                  } found`}
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm lg:max-w-md">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search packages or services"
              aria-label="Search packages or services"
              className="min-h-12 w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div
            role="alert"
            className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/60 dark:bg-red-950/20 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-red-100 p-2 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                <AlertCircle className="h-5 w-5" />
              </div>

              <div>
                <p className="font-semibold text-red-900 dark:text-red-300">
                  Could not load packages
                </p>
                <p className="mt-1 text-sm leading-6 text-red-800/80 dark:text-red-300/80">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadPackages()}
              disabled={loading}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/40"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div
            aria-label="Loading packages"
            aria-busy="true"
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="h-2 bg-emerald-600/70" />
                <div className="animate-pulse space-y-5 p-5 sm:p-6">
                  <div className="h-5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
                    <div className="h-3 w-5/6 rounded bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                  <div className="h-8 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-11 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredPackages.length === 0 && (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white px-5 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/60 sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              {search ? (
                <Search className="h-7 w-7" />
              ) : (
                <Mountain className="h-7 w-7" />
              )}
            </div>

            <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
              {search
                ? "No matching packages"
                : "No packages available yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {search
                ? "Try another package name or search for a service included in a package."
                : "There are currently no active packages to display. Please check again later."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Package Cards */}
        {!error && !loading && filteredPackages.length > 0 && (
          <div className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPackages.map((pkg) => (
              <article
                key={pkg.id}
                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800"
              >
                <div className="h-1.5 bg-gradient-to-r from-emerald-700 via-emerald-500 to-teal-400" />

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <Mountain className="h-5 w-5" />
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>

                  <h3 className="mt-5 break-words text-lg font-bold leading-snug text-zinc-900 dark:text-white">
                    {pkg.name}
                  </h3>

                  <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {pkg.description || "Explore this Mount Pulag package."}
                  </p>

                  <div className="mt-5 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Package price
                    </p>

                    <p className="mt-1 break-words text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
                      {formatPrice(pkg.price)}
                    </p>

                    <div className="mt-3 flex items-center gap-2 border-t border-zinc-200 pt-3 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                      <Users className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                      <span>
                        Maximum {pkg.max_tourists}{" "}
                        {pkg.max_tourists === 1 ? "tourist" : "tourists"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Included services
                    </h4>

                    {pkg.services.length > 0 ? (
                      <ul className="mt-3 space-y-2.5">
                        {pkg.services.map((service) => (
                          <li
                            key={service.id}
                            className="flex items-start gap-2.5 text-sm leading-5 text-zinc-700 dark:text-zinc-300"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span className="break-words">
                              {service.service}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                        No services listed for this package.
                      </p>
                    )}
                  </div>

                  {onSelectPackage && (
                    <button
                      type="button"
                      onClick={() => onSelectPackage(pkg)}
                      className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-600/20"
                    >
                      Select package
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="pb-2 text-center text-xs leading-5 text-zinc-500 dark:text-zinc-500">
        Package availability and included services are based on the
        information provided by E-PULAG.
      </p>
    </div>
  );
}
