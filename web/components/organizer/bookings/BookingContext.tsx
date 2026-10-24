"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import type { ApiPackageBooking } from "@/components/organizer/BookingDetailsModal";

export type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "Cancelled"
  | "Completed";

export type CoordinationStatus =
  | "Not Coordinated"
  | "Pending"
  | "Coordinated";

export type ApiCoordinationStatus =
  | "NOT_COORDINATED"
  | "PENDING"
  | "COORDINATED";

type ApiBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type PackageBooking = {
  id: string;
  packageName: string;
  date: string;
  rawDate: string;
  tourists: number;
  amount: number;
  status: BookingStatus;
  coordination: CoordinationStatus;
};

type BookingContextValue = {
  bookings: PackageBooking[];
  apiBookings: ApiPackageBooking[];
  filteredBookings: PackageBooking[];
  loading: boolean;
  error: string;
  actionError: string;
  cancelling: boolean;
  coordinationLoadingId: number | null;
  search: string;
  statusFilter: string;
  coordinationFilter: string;
  dateFilter: string;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalTourists: number;
  selectedBooking: ApiPackageBooking | null;
  bookingToCancel: ApiPackageBooking | null;
  setSearch: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setCoordinationFilter: (value: string) => void;
  setDateFilter: (value: string) => void;
  setSelectedBooking: (booking: ApiPackageBooking | null) => void;
  setBookingToCancel: (booking: ApiPackageBooking | null) => void;
  setActionError: (value: string) => void;
  cancelBooking: () => Promise<void>;
  updateCoordination: (
    booking: ApiPackageBooking,
    status: ApiCoordinationStatus
  ) => Promise<boolean>;
  refreshBookings: () => Promise<void>;
};

const BookingContext = createContext<BookingContextValue | null>(null);

function formatBookingStatus(status: ApiBookingStatus): BookingStatus {
  const statuses: Record<ApiBookingStatus, BookingStatus> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    CANCELLED: "Cancelled",
    COMPLETED: "Completed",
  };

  return statuses[status] ?? "Pending";
}

function formatCoordinationStatus(
  status: ApiCoordinationStatus
): CoordinationStatus {
  const statuses: Record<ApiCoordinationStatus, CoordinationStatus> = {
    NOT_COORDINATED: "Not Coordinated",
    PENDING: "Pending",
    COORDINATED: "Coordinated",
  };

  return statuses[status] ?? "Not Coordinated";
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;
  const apiUrl =
    process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:8000";

  const [apiBookings, setApiBookings] = useState<ApiPackageBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [coordinationLoadingId, setCoordinationLoadingId] =
    useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [coordinationFilter, setCoordinationFilter] = useState(
    "All Verification Statuses"
  );
  const [dateFilter, setDateFilter] = useState("");
  const [selectedBooking, setSelectedBooking] =
    useState<ApiPackageBooking | null>(null);
  const [bookingToCancel, setBookingToCancel] =
    useState<ApiPackageBooking | null>(null);

  const bookings = useMemo<PackageBooking[]>(
    () =>
      apiBookings.map((booking) => ({
        id: booking.booking_number,
        packageName: booking.package?.name ?? "Unknown Package",
        date: formatDate(booking.hiking_date),
        rawDate: booking.hiking_date.slice(0, 10),
        tourists: booking.tourist_count,
        amount: Number(booking.package?.price ?? 0),
        status: formatBookingStatus(booking.status),
        coordination: formatCoordinationStatus(
          booking.coordination_status
        ),
      })),
    [apiBookings]
  );

  const refreshBookings = useCallback(async () => {
    if (!token) {
      setApiBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/api/package-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load package bookings.");
      }

      setApiBookings(
        Array.isArray(data.bookings) ? data.bookings : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load package bookings."
      );
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (!token) {
      setApiBookings([]);
      setLoading(false);
      setError("You must be logged in to view bookings.");
      return;
    }

    void refreshBookings();
  }, [sessionStatus, token, refreshBookings]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !query ||
        booking.id.toLowerCase().includes(query) ||
        booking.packageName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All Status" ||
        booking.status === statusFilter;

      const matchesCoordination =
        coordinationFilter === "All Verification Statuses" ||
        (coordinationFilter === "Not Verified" &&
          booking.coordination === "Not Coordinated") ||
        (coordinationFilter === "Verification Pending" &&
          booking.coordination === "Pending") ||
        (coordinationFilter === "Verified" &&
          booking.coordination === "Coordinated");

      const matchesDate =
        !dateFilter || booking.rawDate === dateFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCoordination &&
        matchesDate
      );
    });
  }, [bookings, search, statusFilter, coordinationFilter, dateFilter]);

  const totalBookings = bookings.length;

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "Confirmed"
  ).length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "Pending"
  ).length;

  const totalTourists = bookings.reduce(
    (total, booking) => total + booking.tourists,
    0
  );

  const cancelBooking = useCallback(async () => {
    if (!bookingToCancel || !token) {
      setActionError("You must be logged in to cancel a booking.");
      return;
    }

    if (
      bookingToCancel.status === "CANCELLED" ||
      bookingToCancel.status === "COMPLETED"
    ) {
      setActionError("This booking can no longer be cancelled.");
      return;
    }

    setCancelling(true);
    setActionError("");

    try {
      const response = await fetch(
        `${apiUrl}/api/package-bookings/${bookingToCancel.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to cancel the booking.");
      }

      setApiBookings((current) =>
        current.map((booking) =>
          booking.id === bookingToCancel.id
            ? { ...booking, status: "CANCELLED" }
            : booking
        )
      );

      setBookingToCancel(null);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to cancel the booking."
      );
    } finally {
      setCancelling(false);
    }
  }, [apiUrl, bookingToCancel, token]);

  const updateCoordination = useCallback(
    async (
      booking: ApiPackageBooking,
      status: ApiCoordinationStatus
    ): Promise<boolean> => {
      if (!token) {
        setActionError("You must be logged in to update coordination.");
        return false;
      }

      setCoordinationLoadingId(booking.id);
      setActionError("");

      try {
        const response = await fetch(
          `${apiUrl}/api/package-bookings/${booking.id}/coordination`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            body: JSON.stringify({
              coordination_status: status,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to update DENR coordination."
          );
        }

        if (!data.booking) {
          throw new Error("The server did not return the updated booking.");
        }

        const updatedBooking = data.booking as ApiPackageBooking;

        setApiBookings((current) =>
          current.map((item) =>
            item.id === updatedBooking.id ? updatedBooking : item
          )
        );

        setSelectedBooking((current) =>
          current?.id === updatedBooking.id ? updatedBooking : current
        );

        return true;
      } catch (err) {
        setActionError(
          err instanceof Error
            ? err.message
            : "Failed to update DENR coordination."
        );

        return false;
      } finally {
        setCoordinationLoadingId(null);
      }
    },
    [apiUrl, token]
  );

  const value = useMemo<BookingContextValue>(
    () => ({
      bookings,
      apiBookings,
      filteredBookings,
      loading,
      error,
      actionError,
      cancelling,
      coordinationLoadingId,
      search,
      statusFilter,
      coordinationFilter,
      dateFilter,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      totalTourists,
      selectedBooking,
      bookingToCancel,
      setSearch,
      setStatusFilter,
      setCoordinationFilter,
      setDateFilter,
      setSelectedBooking,
      setBookingToCancel,
      setActionError,
      cancelBooking,
      updateCoordination,
      refreshBookings,
    }),
    [
      bookings,
      apiBookings,
      filteredBookings,
      loading,
      error,
      actionError,
      cancelling,
      coordinationLoadingId,
      search,
      statusFilter,
      coordinationFilter,
      dateFilter,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      totalTourists,
      selectedBooking,
      bookingToCancel,
      cancelBooking,
      updateCoordination,
      refreshBookings,
    ]
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error("useBookings must be used inside BookingProvider.");
  }

  return context;
}
