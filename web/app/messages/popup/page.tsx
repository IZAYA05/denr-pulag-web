import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import AuthSessionProvider from "@/components/providers/SessionProvider";
import Chatbox from "@/components/shared/chatbox/Chatbox";

export default async function MessagesPopupPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const role = String(session.user?.role || "").toUpperCase();

  if (!["ADMIN", "EMPLOYEE", "USER"].includes(role)) {
    redirect("/login");
  }

  if (!session.user?.accessToken) {
    redirect("/login");
  }

  const mode = role === "ADMIN" || role === "EMPLOYEE" ? "staff" : "visitor";

  return (
    <AuthSessionProvider>
      <main className="min-h-screen bg-zinc-50 p-3 dark:bg-zinc-950 sm:p-4">
        <Chatbox mode={mode} embedded />
      </main>
    </AuthSessionProvider>
  );
}
