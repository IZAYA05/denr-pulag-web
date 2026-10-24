
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

export type PackageStatus = "Active" | "Inactive";

export type ApiPackageService = {
  id: number;
  package_id: number;
  service: string;
};

export type ApiOrganizerPackage = {
  id: number;
  organizer_id: number;
  name: string;
  description: string;
  price: string | number;
  max_tourists: number;
  status: string;
  services: ApiPackageService[];
  created_at?: string;
  updated_at?: string;
};

export type OrganizerPackage = {
  id: number;
  name: string;
  description: string;
  price: number;
  services: string[];
  maxTourists: number;
  status: PackageStatus;
};

export type PackageFormData = {
  name: string;
  description: string;
  price: number;
  maxTourists: number;
  services: string[];
};

type PackageContextValue = {
  packages: OrganizerPackage[];
  filteredPackages: OrganizerPackage[];
  search: string;
  statusFilter: string;
  loading: boolean;
  saving: boolean;
  togglingId: number | null;
  deletingId: number | null;
  error: string;
  isFormOpen: boolean;
  isViewOpen: boolean;
  editingPackage: OrganizerPackage | null;
  viewingPackage: OrganizerPackage | null;
  totalPackages: number;
  activePackages: number;
  inactivePackages: number;
  setSearch: (value: string) => void;
  setStatusFilter: (value: string) => void;
  openCreate: () => void;
  openEdit: (packageItem: OrganizerPackage) => void;
  openView: (packageItem: OrganizerPackage) => void;
  closeForm: () => void;
  closeView: () => void;
  savePackage: (data: PackageFormData) => Promise<boolean>;
  toggleStatus: (packageItem: OrganizerPackage) => Promise<void>;
  deletePackage: (packageItem: OrganizerPackage) => Promise<void>;
  refreshPackages: () => Promise<void>;
};

const PackageContext = createContext<PackageContextValue | undefined>(
  undefined
);

function formatApiStatus(status: string): PackageStatus {
  return status.toUpperCase() === "ACTIVE" ? "Active" : "Inactive";
}

function formatApiPackage(
  packageItem: ApiOrganizerPackage
): OrganizerPackage {
  return {
    id: packageItem.id,
    name: packageItem.name,
    description: packageItem.description,
    price: Number(packageItem.price),
    services: Array.isArray(packageItem.services)
      ? packageItem.services.map((service) => service.service)
      : [],
    maxTourists: Number(packageItem.max_tourists),
    status: formatApiStatus(packageItem.status),
  };
}

function getErrorMessage(data: Record<string, unknown>): string {
  const errors = data.errors;

  if (errors && typeof errors === "object") {
    const firstError = Object.values(
      errors as Record<string, unknown>
    )
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .find((message): message is string => typeof message === "string");

    if (firstError) {
      return firstError;
    }
  }

  return typeof data.message === "string"
    ? data.message
    : "The request could not be completed.";
}

async function readResponseData(
  response: Response
): Promise<Record<string, unknown>> {
  const text = await response.text();

  if (!text.trim()) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(text);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }

    return { message: "The server returned an unexpected response." };
  } catch {
    return {
      message:
        response.statusText ||
        "The server returned a response that could not be read.",
    };
  }
}

function getUnknownErrorMessage(
  error: unknown,
  fallback: string
): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

export function PackageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session, status: sessionStatus } = useSession();

  const [packages, setPackages] = useState<OrganizerPackage[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingPackage, setEditingPackage] =
    useState<OrganizerPackage | null>(null);
  const [viewingPackage, setViewingPackage] =
    useState<OrganizerPackage | null>(null);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:8000";
  const accessToken = session?.user?.accessToken;

  const refreshPackages = useCallback(async () => {
    if (sessionStatus !== "authenticated" || !accessToken) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/organizer/packages`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        }
      );

      const data = await readResponseData(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      const apiPackages: ApiOrganizerPackage[] = Array.isArray(
        data.packages
      )
        ? (data.packages as ApiOrganizerPackage[])
        : [];

      setPackages(apiPackages.map(formatApiPackage));
    } catch (err) {
      setError(
        getUnknownErrorMessage(err, "Failed to load packages.")
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, apiBaseUrl, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      void refreshPackages();
    } else if (sessionStatus === "unauthenticated") {
      setPackages([]);
      setLoading(false);
    }
  }, [refreshPackages, sessionStatus]);

  const openCreate = useCallback(() => {
    setError("");
    setEditingPackage(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((packageItem: OrganizerPackage) => {
    setError("");
    setEditingPackage(packageItem);
    setIsFormOpen(true);
  }, []);

  const openView = useCallback((packageItem: OrganizerPackage) => {
    setError("");
    setViewingPackage(packageItem);
    setIsViewOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    if (saving) {
      return;
    }

    setIsFormOpen(false);
    setEditingPackage(null);
    setError("");
  }, [saving]);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingPackage(null);
  }, []);

  const savePackage = useCallback(
    async (data: PackageFormData): Promise<boolean> => {
      if (!accessToken) {
        setError("You are not authenticated.");
        return false;
      }

      if (
        !Number.isInteger(data.maxTourists) ||
        data.maxTourists < 1 ||
        data.maxTourists > 12
      ) {
        setError("Tourist capacity must be between 1 and 12.");
        return false;
      }

      setSaving(true);
      setError("");

      try {
        const isEditing = Boolean(editingPackage);
        const url = isEditing
          ? `${apiBaseUrl}/api/organizer/packages/${editingPackage!.id}`
          : `${apiBaseUrl}/api/organizer/packages`;

        const response = await fetch(url, {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            price: data.price,
            max_tourists: data.maxTourists,
            services: data.services,
          }),
        });

        const responseData = await readResponseData(response);

        if (!response.ok) {
          setError(getErrorMessage(responseData));
          return false;
        }

        await refreshPackages();
        setIsFormOpen(false);
        setEditingPackage(null);
        setError("");

        return true;
      } catch (err) {
        setError(
          getUnknownErrorMessage(err, "Failed to save package.")
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [accessToken, apiBaseUrl, editingPackage, refreshPackages]
  );

  const toggleStatus = useCallback(
    async (packageItem: OrganizerPackage): Promise<void> => {
      if (!accessToken) {
        setError("You are not authenticated.");
        return;
      }

      setTogglingId(packageItem.id);
      setError("");

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/organizer/packages/${packageItem.id}/status`,
          {
            method: "PATCH",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await readResponseData(response);

        if (!response.ok) {
          setError(getErrorMessage(data));
          return;
        }

        await refreshPackages();
      } catch (err) {
        setError(
          getUnknownErrorMessage(
            err,
            "Failed to update package status."
          )
        );
      } finally {
        setTogglingId(null);
      }
    },
    [accessToken, apiBaseUrl, refreshPackages]
  );

  const deletePackage = useCallback(
    async (packageItem: OrganizerPackage): Promise<void> => {
      if (!accessToken) {
        setError("You are not authenticated.");
        return;
      }

      setDeletingId(packageItem.id);
      setError("");

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/organizer/packages/${packageItem.id}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await readResponseData(response);

        if (!response.ok) {
          // Expected business-rule rejections belong in the UI,
          // not console.error(), which can trigger the Next.js overlay.
          setError(getErrorMessage(data));
          return;
        }

        setPackages((current) =>
          current.filter((item) => item.id !== packageItem.id)
        );
        setError("");
      } catch (err) {
        // Network and unexpected errors are shown in the toast as well.
        // Do not use console.error() here because Next.js may display
        // its development error overlay for console errors.
        setError(
          getUnknownErrorMessage(
            err,
            "An unexpected error occurred while deleting the package."
          )
        );
      } finally {
        setDeletingId(null);
      }
    },
    [accessToken, apiBaseUrl]
  );

  const filteredPackages = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return packages.filter((packageItem) => {
      const matchesSearch =
        normalizedSearch === "" ||
        packageItem.name.toLowerCase().includes(normalizedSearch) ||
        packageItem.description.toLowerCase().includes(normalizedSearch) ||
        packageItem.services.some((service) =>
          service.toLowerCase().includes(normalizedSearch)
        );

      const matchesStatus =
        statusFilter === "All Status" ||
        packageItem.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [packages, search, statusFilter]);

  const totalPackages = packages.length;

  const activePackages = packages.filter(
    (item) => item.status === "Active"
  ).length;

  const inactivePackages = packages.filter(
    (item) => item.status === "Inactive"
  ).length;

  const value = useMemo<PackageContextValue>(
    () => ({
      packages,
      filteredPackages,
      search,
      statusFilter,
      loading,
      saving,
      togglingId,
      deletingId,
      error,
      isFormOpen,
      isViewOpen,
      editingPackage,
      viewingPackage,
      totalPackages,
      activePackages,
      inactivePackages,
      setSearch,
      setStatusFilter,
      openCreate,
      openEdit,
      openView,
      closeForm,
      closeView,
      savePackage,
      toggleStatus,
      deletePackage,
      refreshPackages,
    }),
    [
      packages,
      filteredPackages,
      search,
      statusFilter,
      loading,
      saving,
      togglingId,
      deletingId,
      error,
      isFormOpen,
      isViewOpen,
      editingPackage,
      viewingPackage,
      totalPackages,
      activePackages,
      inactivePackages,
      openCreate,
      openEdit,
      openView,
      closeForm,
      closeView,
      savePackage,
      toggleStatus,
      deletePackage,
      refreshPackages,
    ]
  );

  return (
    <PackageContext.Provider value={value}>
      {children}
    </PackageContext.Provider>
  );
}

export function usePackages() {
  const context = useContext(PackageContext);

  if (!context) {
    throw new Error("usePackages must be used inside PackageProvider.");
  }

  return context;
}
