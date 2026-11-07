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

export type ProfileUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  image: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type LoginActivity = {
  id: number;
  user_id: number;
  role: string;
  action: string;
  module: string;
  description: string | null;
  ip_address: string | null;
  created_at: string;
};

export type ProfileFormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

export type PasswordFormData = {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
};

type ProfileContextValue = {
  profile: ProfileUser | null;
  loginActivity: LoginActivity[];
  loading: boolean;
  saving: boolean;
  changingPassword: boolean;
  error: string;
  success: string;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: ProfileFormData) => Promise<boolean>;
  changePassword: (data: PasswordFormData) => Promise<boolean>;
  clearMessages: () => void;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(
  undefined
);

function getErrorMessage(data: Record<string, unknown>): string {
  const errors = data.errors;

  if (errors && typeof errors === "object") {
    const firstError = Object.values(errors as Record<string, unknown>)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .find(
        (message): message is string =>
          typeof message === "string"
      );

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

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<string, unknown>;
    }

    return {};
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

function getLoginActivity(
  data: Record<string, unknown>
): LoginActivity[] {
  const pagination = data.data;

  if (Array.isArray(pagination)) {
    return pagination as LoginActivity[];
  }

  if (
    pagination &&
    typeof pagination === "object" &&
    "data" in pagination &&
    Array.isArray(pagination.data)
  ) {
    return pagination.data as LoginActivity[];
  }

  return [];
}

export function ProfileProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    data: session,
    status: sessionStatus,
    update: updateSession,
  } = useSession();

  const accessToken = session?.user?.accessToken;

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_LARAVEL_API_URL ||
    "http://localhost:18000";

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loginActivity, setLoginActivity] = useState<LoginActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  const refreshProfile = useCallback(async () => {
    if (sessionStatus !== "authenticated" || !accessToken) {
      return;
    }

    setLoading(true);
    setError("");

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      const [profileResponse, activityResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/api/profile`, {
          method: "GET",
          headers,
          cache: "no-store",
        }),
        fetch(`${apiBaseUrl}/api/profile/login-activity`, {
          method: "GET",
          headers,
          cache: "no-store",
        }),
      ]);

      const profileData = await readResponseData(profileResponse);

      if (!profileResponse.ok) {
        throw new Error(getErrorMessage(profileData));
      }

      if (
        !profileData.user ||
        typeof profileData.user !== "object"
      ) {
        throw new Error("The server did not return profile information.");
      }

      setProfile(profileData.user as ProfileUser);

      if (activityResponse.ok) {
        const activityData = await readResponseData(activityResponse);
        setLoginActivity(getLoginActivity(activityData));
      } else {
        setLoginActivity([]);
      }
    } catch (err) {
      setError(
        getUnknownErrorMessage(err, "Failed to load your profile.")
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, apiBaseUrl, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "authenticated" && accessToken) {
      void refreshProfile();
    } else if (sessionStatus === "unauthenticated") {
      setProfile(null);
      setLoginActivity([]);
      setLoading(false);
    }
  }, [accessToken, refreshProfile, sessionStatus]);

  const updateProfile = useCallback(
    async (data: ProfileFormData): Promise<boolean> => {
      if (!accessToken) {
        setError("You are not authenticated.");
        return false;
      }

      setSaving(true);
      clearMessages();

      try {
        const response = await fetch(`${apiBaseUrl}/api/profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(data),
        });

        const responseData = await readResponseData(response);

        if (!response.ok) {
          setError(getErrorMessage(responseData));
          return false;
        }

        if (
          responseData.user &&
          typeof responseData.user === "object"
        ) {
          setProfile(responseData.user as ProfileUser);
        }

        try {
          await updateSession();
        } catch {
          // Laravel has already saved the profile.
          // Keep the returned profile data in the current page.
        }

        setSuccess(
          typeof responseData.message === "string"
            ? responseData.message
            : "Profile updated successfully."
        );

        return true;
      } catch (err) {
        setError(
          getUnknownErrorMessage(err, "Failed to update your profile.")
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [accessToken, apiBaseUrl, clearMessages, updateSession]
  );

  const changePassword = useCallback(
    async (data: PasswordFormData): Promise<boolean> => {
      if (!accessToken) {
        setError("You are not authenticated.");
        return false;
      }

      setChangingPassword(true);
      clearMessages();

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/profile/password`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
          }
        );

        const responseData = await readResponseData(response);

        if (!response.ok) {
          setError(getErrorMessage(responseData));
          return false;
        }

        setSuccess(
          typeof responseData.message === "string"
            ? responseData.message
            : "Password changed successfully."
        );

        return true;
      } catch (err) {
        setError(
          getUnknownErrorMessage(err, "Failed to update your password.")
        );
        return false;
      } finally {
        setChangingPassword(false);
      }
    },
    [accessToken, apiBaseUrl, clearMessages]
  );

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      loginActivity,
      loading,
      saving,
      changingPassword,
      error,
      success,
      refreshProfile,
      updateProfile,
      changePassword,
      clearMessages,
    }),
    [
      profile,
      loginActivity,
      loading,
      saving,
      changingPassword,
      error,
      success,
      refreshProfile,
      updateProfile,
      changePassword,
      clearMessages,
    ]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used inside ProfileProvider.");
  }

  return context;
}
