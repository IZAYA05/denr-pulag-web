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

export type NotificationData = {
  title?: string;
  message?: string;
  type?: string;
  url?: string | null;
  [key: string]: unknown;
};

export type AppNotification = {
  id: string;
  type: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
};

type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string;
  refreshNotifications: (silent?: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
};

const NotificationContext = createContext<
  NotificationContextValue | undefined
>(undefined);

export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken = session?.user?.accessToken;

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:8000";

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshNotifications = useCallback(
    async (silent = false) => {
      if (!accessToken) {
        return;
      }

      if (!silent) {
        setLoading(true);
      }

      setError("");

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/notifications?per_page=10`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to retrieve notifications."
          );
        }

        setNotifications(
          Array.isArray(data.notifications)
            ? data.notifications
            : []
        );

        setUnreadCount(
          Number(data.unread_count) || 0
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load notifications."
        );
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [accessToken, apiBaseUrl]
  );

  useEffect(() => {
    if (sessionStatus === "authenticated" && accessToken) {
      void refreshNotifications();

      const interval = window.setInterval(() => {
        void refreshNotifications(true);
      }, 30000);

      return () => window.clearInterval(interval);
    }

    if (sessionStatus === "unauthenticated") {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [
    accessToken,
    refreshNotifications,
    sessionStatus,
  ]);

  const markAsRead = useCallback(
    async (id: string): Promise<boolean> => {
      if (!accessToken) {
        setError("You are not authenticated.");
        return false;
      }

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/notifications/${id}/read`,
          {
            method: "PATCH",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to mark notification as read."
          );
        }

        const wasUnread = notifications.some(
          (notification) =>
            notification.id === id &&
            notification.read_at === null
        );

        setNotifications((current) =>
          current.map((notification) =>
            notification.id === id
              ? {
                  ...notification,
                  read_at:
                    notification.read_at || new Date().toISOString(),
                }
              : notification
          )
        );

        if (wasUnread) {
          setUnreadCount((current) => Math.max(0, current - 1));
        }

        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to mark notification as read."
        );
        return false;
      }
    },
    [accessToken, apiBaseUrl, notifications]
  );

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    if (!accessToken) {
      setError("You are not authenticated.");
      return false;
    }

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to mark notifications as read."
        );
      }

      const now = new Date().toISOString();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read_at: notification.read_at || now,
        }))
      );

      setUnreadCount(0);

      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark all notifications as read."
      );
      return false;
    }
  }, [accessToken, apiBaseUrl]);

  const deleteNotification = useCallback(
    async (id: string): Promise<boolean> => {
      if (!accessToken) {
        setError("You are not authenticated.");
        return false;
      }

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/notifications/${id}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to delete notification."
          );
        }

        const wasUnread = notifications.some(
          (notification) =>
            notification.id === id &&
            notification.read_at === null
        );

        setNotifications((current) =>
          current.filter((notification) => notification.id !== id)
        );

        if (wasUnread) {
          setUnreadCount((current) => Math.max(0, current - 1));
        }

        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to delete notification."
        );
        return false;
      }
    },
    [accessToken, apiBaseUrl, notifications]
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider."
    );
  }

  return context;
}
