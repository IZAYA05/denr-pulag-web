import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import AuthSessionProvider from "@/components/providers/SessionProvider";
import AdminShell from "@/components/admin/AdminShell";
import DashboardClient from "@/components/admin/DashboardClient";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "EMPLOYEE"
  ) {
    redirect("/user");
  }

  const accessToken = session.user.accessToken;

  if (!accessToken) {
    redirect("/login");
  }

  return (
    <AuthSessionProvider>
      <AdminShell>
        <DashboardClient accessToken={accessToken}>
          {children}
        </DashboardClient>
      </AdminShell>
    </AuthSessionProvider>
  );
}