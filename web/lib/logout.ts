/** Revoke the Laravel Sanctum token before clearing the NextAuth session. */
export async function revokeLaravelSession(accessToken?: string | null): Promise<void> {
  if (!accessToken) return;

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

  try {
    await fetch(`${apiBaseUrl.replace(/\/+$/, "")}/api/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
  } catch {
    // Always allow the local NextAuth session to end, even if the API is offline.
  }
}
