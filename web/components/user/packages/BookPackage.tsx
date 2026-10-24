"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Plus,
  Trash2,
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

type ApiTrail = {
  id: number;
  name: string;
  description?: string | null;
  difficulty?: string | null;
  is_active: boolean | number;
};

type Tourist = {
  full_name: string;
  age: string;
  gender: string;
  nationality: string;
  contact_number: string;
  address: string;
  emergency_contact: string;
  emergency_number: string;
};

type ApiError = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

const emptyTourist = (): Tourist => ({
  full_name: "",
  age: "",
  gender: "",
  nationality: "",
  contact_number: "",
  address: "",
  emergency_contact: "",
  emergency_number: "",
});

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getErrorMessage(
  data: ApiError,
  fallback: string,
): string {
  if (typeof data.message === "string") {
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

    return data.message;
  }

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

  return fallback;
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

export default function BookPackage({
  initialPackageId,
}: {
  initialPackageId: string;
}) {
  const router = useRouter();
  const { data: session, status: sessionStatus } =
    useSession();

  const [packages, setPackages] = useState<ApiPackage[]>([]);
  const [trails, setTrails] = useState<ApiTrail[]>([]);
  const [packageId, setPackageId] = useState(initialPackageId);
  const [trailId, setTrailId] = useState("");
  const [hikingDate, setHikingDate] = useState("");
  const [tourists, setTourists] = useState<Tourist[]>([
    emptyTourist(),
  ]);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bookingNumber, setBookingNumber] = useState("");

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_LARAVEL_API_URL ||
    "http://localhost:8000";

  const accessToken = session?.user?.accessToken;

  const selectedPackage = useMemo(
    () =>
      packages.find(
        (item) => String(item.id) === packageId,
      ),
    [packages, packageId],
  );

  const today = localDateString(new Date());

  const latestBookingDate = useMemo(() => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setMonth(date.getMonth() + 1);

    return localDateString(date);
  }, []);

  const maximumTourists = Math.min(
    12,
    Math.max(1, Number(selectedPackage?.max_tourists) || 12),
  );

  const totalPrice = Number(selectedPackage?.price) * tourists.length;

  useEffect(() => {
    setPackageId(initialPackageId);
  }, [initialPackageId]);

  useEffect(() => {
    if (sessionStatus === "loading") {
      setLoading(true);
      return;
    }

    if (!accessToken) {
      setLoading(false);
      setError("Please sign in before making a booking.");
      return;
    }

    let cancelled = false;

    async function loadFormOptions() {
      setLoading(true);
      setError("");

      try {
        const headers = {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        };

        const [packageResponse, trailResponse] =
          await Promise.all([
            fetch(`${apiBaseUrl}/api/packages`, {
              headers,
              cache: "no-store",
            }),
            fetch(`${apiBaseUrl}/api/trails`, {
              headers,
              cache: "no-store",
            }),
          ]);

        const [packageData, trailData] = await Promise.all([
          readResponse(packageResponse),
          readResponse(trailResponse),
        ]);

        if (!packageResponse.ok) {
          throw new Error(
            getErrorMessage(
              packageData as ApiError,
              "Unable to load packages.",
            ),
          );
        }

        if (!trailResponse.ok) {
          throw new Error(
            getErrorMessage(
              trailData as ApiError,
              "Unable to load active trails.",
            ),
          );
        }

        const packageList = Array.isArray(packageData.packages)
          ? (packageData.packages as ApiPackage[]).filter(
              (item) =>
                item.status?.toUpperCase() === "ACTIVE",
            )
          : [];

        const trailList = Array.isArray(trailData.trails)
          ? (trailData.trails as ApiTrail[]).filter(
              (item) =>
                item.is_active === true ||
                item.is_active === 1,
            )
          : [];

        if (cancelled) {
          return;
        }

        setPackages(packageList);
        setTrails(trailList);

        if (
          !packageList.some(
            (item) => String(item.id) === initialPackageId,
          )
        ) {
          setPackageId(
            packageList.length > 0
              ? String(packageList[0].id)
              : "",
          );
        }

        if (trailList.length > 0) {
          setTrailId(String(trailList[0].id));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load booking options.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadFormOptions();

    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    apiBaseUrl,
    initialPackageId,
    sessionStatus,
  ]);

  useEffect(() => {
    setTourists((current) => {
      if (current.length > maximumTourists) {
        return current.slice(0, maximumTourists);
      }

      return current.length > 0 ? current : [emptyTourist()];
    });
  }, [maximumTourists]);

  function updateTourist(
    index: number,
    field: keyof Tourist,
    value: string,
  ) {
    setTourists((current) =>
      current.map((tourist, touristIndex) =>
        touristIndex === index
          ? { ...tourist, [field]: value }
          : tourist,
      ),
    );
  }

  function addTourist() {
    setError("");

    if (tourists.length >= maximumTourists) {
      setError(
        `This package allows a maximum of ${maximumTourists} tourists per booking.`,
      );
      return;
    }

    setTourists((current) => [...current, emptyTourist()]);
  }

  function removeTourist(index: number) {
    if (tourists.length <= 1) {
      setError("A booking must include at least one tourist.");
      return;
    }

    setTourists((current) =>
      current.filter((_, touristIndex) => touristIndex !== index),
    );
    setError("");
  }

  async function submitBooking(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setBookingNumber("");

    if (!accessToken) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    if (!selectedPackage) {
      setError("Please select an available package.");
      return;
    }

    if (!trails.some((trail) => String(trail.id) === trailId)) {
      setError("Please select an active trail.");
      return;
    }

    if (!hikingDate || hikingDate < today) {
      setError("Please select a valid hiking date.");
      return;
    }

    if (hikingDate > latestBookingDate) {
      setError(
        "Bookings can only be made up to one month in advance.",
      );
      return;
    }

    if (
      tourists.length < 1 ||
      tourists.length > maximumTourists
    ) {
      setError(
        `This booking must contain between 1 and ${maximumTourists} tourists.`,
      );
      return;
    }

    const incompleteIndex = tourists.findIndex(
      (tourist) =>
        !tourist.full_name.trim() ||
        !tourist.age ||
        Number(tourist.age) < 1 ||
        Number(tourist.age) > 150 ||
        !tourist.gender ||
        !tourist.nationality.trim() ||
        !tourist.emergency_contact.trim() ||
        !tourist.emergency_number.trim(),
    );

    if (incompleteIndex !== -1) {
      setError(
        `Please complete all required fields for Tourist ${incompleteIndex + 1}.`,
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/package-bookings`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            package_id: Number(packageId),
            trail_id: Number(trailId),
            hiking_date: hikingDate,
            tourist_count: tourists.length,
            remarks: remarks.trim() || null,
            tourists: tourists.map((tourist) => ({
              full_name: tourist.full_name.trim(),
              age: Number(tourist.age),
              gender: tourist.gender,
              nationality: tourist.nationality.trim(),
              contact_number:
                tourist.contact_number.trim() || null,
              address: tourist.address.trim() || null,
              emergency_contact:
                tourist.emergency_contact.trim(),
              emergency_number:
                tourist.emergency_number.trim(),
            })),
          }),
        },
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data as ApiError,
            "Unable to submit your booking.",
          ),
        );
      }

      const booking = data.booking as
        | { booking_number?: string }
        | undefined;

      setBookingNumber(booking?.booking_number || "");
      setSuccess(
        typeof data.message === "string"
          ? data.message
          : "Your booking has been submitted successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your booking. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-zinc-500">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Loading booking options...
      </div>
    );
  }

  if (success) {
    return (
      <section className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm dark:border-emerald-900 dark:bg-zinc-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          <CheckCircle2 className="h-9 w-9" />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-zinc-900 dark:text-white">
          Booking submitted
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {success}
        </p>

        {bookingNumber && (
          <div className="mt-5 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Booking number
            </p>
            <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
              {bookingNumber}
            </p>
          </div>
        )}

        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Your booking is awaiting processing. Please follow the
          instructions from DENR regarding payment and requirements.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/user/reservations")}
            className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            View My Reservations
          </button>

          <button
            type="button"
            onClick={() => router.push("/user")}
            className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Browse Packages
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        type="button"
        onClick={() => router.push("/user")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to packages
      </button>

      <section className="rounded-3xl bg-emerald-950 px-6 py-8 text-white sm:px-9">
        <p className="text-sm font-medium text-emerald-200">
          Mount Pulag National Park
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          Book a Package
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-100/80">
          Select your package and hiking schedule, then provide the
          required details for every tourist in your booking.
        </p>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {packages.length === 0 || trails.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          {packages.length === 0
            ? "There are no active packages available for booking."
            : "There are no active trails available for booking."}
          Please contact the administrator if you believe this is incorrect.
        </div>
      ) : (
        <form onSubmit={submitBooking} className="space-y-6">
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              1. Package and hiking schedule
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Package <span className="text-red-500">*</span>
                <select
                  required
                  value={packageId}
                  onChange={(event) => setPackageId(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                >
                  <option value="">Select a package</option>
                  {packages.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Active trail <span className="text-red-500">*</span>
                <select
                  required
                  value={trailId}
                  onChange={(event) => setTrailId(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                >
                  <option value="">Select a trail</option>
                  {trails.map((trail) => (
                    <option key={trail.id} value={trail.id}>
                      {trail.name}
                      {trail.difficulty
                        ? ` — ${trail.difficulty}`
                        : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:col-span-2">
                Hiking date <span className="text-red-500">*</span>
                <input
                  type="date"
                  required
                  min={today}
                  max={latestBookingDate}
                  value={hikingDate}
                  onChange={(event) => setHikingDate(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
                <span className="mt-2 block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                  Bookings are limited to dates within the next month.
                  Dates may still be subject to DENR capacity and holiday
                  restrictions.
                </span>
              </label>
            </div>

            {selectedPackage && (
              <div className="mt-6 rounded-2xl bg-emerald-50 p-5 dark:bg-emerald-950/30">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-semibold text-emerald-950 dark:text-emerald-100">
                      {selectedPackage.name}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-emerald-900/70 dark:text-emerald-200/70">
                      {selectedPackage.description ||
                        "No package description provided."}
                    </p>
                  </div>

                  <div className="shrink-0 sm:text-right">
                    <p className="text-xs text-emerald-800/70 dark:text-emerald-200/70">
                      Package price per person
                    </p>
                    <p className="mt-1 text-xl font-bold text-emerald-950 dark:text-emerald-100">
                      {formatPrice(Number(selectedPackage.price))}
                    </p>
                  </div>
                </div>

                {selectedPackage.services?.length > 0 && (
                  <div className="mt-4 border-t border-emerald-200 pt-4 dark:border-emerald-800">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-900/70 dark:text-emerald-200/70">
                      Included services
                    </p>
                    <ul className="mt-2 space-y-1">
                      {selectedPackage.services.map((service) => (
                        <li
                          key={service.id}
                          className="flex items-start gap-2 text-sm text-emerald-950 dark:text-emerald-100"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                          {service.service}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  2. Tourist information
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Enter each tourist separately. Emergency contact
                  details are required for every tourist.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                <Users className="h-4 w-4" />
                {tourists.length} / {maximumTourists}
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {tourists.map((tourist, index) => (
                <fieldset
                  key={index}
                  className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-700 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <legend className="px-1 text-base font-semibold text-zinc-900 dark:text-white">
                      Tourist {index + 1}
                    </legend>

                    {tourists.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTourist(index)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:col-span-2">
                      Full name <span className="text-red-500">*</span>
                      <input
                        required
                        maxLength={255}
                        value={tourist.full_name}
                        onChange={(event) =>
                          updateTourist(
                            index,
                            "full_name",
                            event.target.value,
                          )
                        }
                        placeholder="Enter full name"
                        className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                      />
                    </label>

                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Age <span className="text-red-500">*</span>
                      <input
                        required
                        type="number"
                        min={1}
                        max={150}
                        value={tourist.age}
                        onChange={(event) =>
                          updateTourist(index, "age", event.target.value)
                        }
                        placeholder="Age"
                        className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                      />
                    </label>

                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Gender <span className="text-red-500">*</span>
                      <select
                        required
                        value={tourist.gender}
                        onChange={(event) =>
                          updateTourist(index, "gender", event.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">
                          Prefer not to say
                        </option>
                      </select>
                    </label>

                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Nationality <span className="text-red-500">*</span>
                      <input
                        required
                        maxLength={255}
                        value={tourist.nationality}
                        onChange={(event) =>
                          updateTourist(
                            index,
                            "nationality",
                            event.target.value,
                          )
                        }
                        placeholder="e.g. Filipino"
                        className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                      />
                    </label>

                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Contact number
                      <input
                        maxLength={50}
                        value={tourist.contact_number}
                        onChange={(event) =>
                          updateTourist(
                            index,
                            "contact_number",
                            event.target.value,
                          )
                        }
                        placeholder="Optional"
                        className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                      />
                    </label>

                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:col-span-2">
                      Address
                      <textarea
                        rows={2}
                        value={tourist.address}
                        onChange={(event) =>
                          updateTourist(
                            index,
                            "address",
                            event.target.value,
                          )
                        }
                        placeholder="Optional address"
                        className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                      />
                    </label>
                  </div>

                  <div className="mt-5 border-t border-zinc-100 pt-5 dark:border-zinc-800">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Emergency contact
                    </h3>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Contact person{" "}
                        <span className="text-red-500">*</span>
                        <input
                          required
                          maxLength={255}
                          value={tourist.emergency_contact}
                          onChange={(event) =>
                            updateTourist(
                              index,
                              "emergency_contact",
                              event.target.value,
                            )
                          }
                          placeholder="Emergency contact name"
                          className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                        />
                      </label>

                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Contact number{" "}
                        <span className="text-red-500">*</span>
                        <input
                          required
                          maxLength={50}
                          value={tourist.emergency_number}
                          onChange={(event) =>
                            updateTourist(
                              index,
                              "emergency_number",
                              event.target.value,
                            )
                          }
                          placeholder="Emergency contact number"
                          className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                        />
                      </label>
                    </div>
                  </div>
                </fieldset>
              ))}
            </div>

            <button
              type="button"
              onClick={addTourist}
              disabled={tourists.length >= maximumTourists}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              <Plus className="h-4 w-4" />
              Add tourist
            </button>

            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Maximum of {maximumTourists} tourists for the selected
              package, subject to DENR booking rules.
            </p>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              3. Additional remarks
            </h2>

            <label className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Remarks or special requests
              <textarea
                rows={3}
                maxLength={2000}
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Optional information for the DENR office"
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              />
            </label>
          </section>

          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/30 sm:p-8">
            <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
              Booking summary
            </h2>

            <div className="mt-4 flex items-start justify-between gap-4 text-sm">
              <span className="text-emerald-900/80 dark:text-emerald-200/80">
                {selectedPackage?.name || "Selected package"}
              </span>
              <span className="text-right font-medium text-emerald-950 dark:text-emerald-100">
                {formatPrice(Number(selectedPackage?.price))} ×{" "}
                {tourists.length} {tourists.length === 1 ? "person" : "people"}
              </span>
            </div>

            <div className="mt-4 border-t border-emerald-200 pt-4 dark:border-emerald-800">
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-emerald-950 dark:text-emerald-100">
                  Estimated package total
                </span>
                <span className="text-xl font-bold text-emerald-950 dark:text-emerald-100">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <p className="mt-3 text-xs leading-5 text-emerald-900/80 dark:text-emerald-200/80">
                This estimate assumes the selected Organizer package price
                is per person. Confirm the package inclusions, including
                whether the DENR entrance fee is included, before payment.
                The entrance fee must not be charged twice. This form
                submits a booking request and does not process payment.
              </p>
            </div>
          </section>

          <button
            type="submit"
            disabled={
              submitting ||
              !selectedPackage ||
              trails.length === 0 ||
              packages.length === 0
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Submitting booking...
              </>
            ) : (
              "Submit Booking Request"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
