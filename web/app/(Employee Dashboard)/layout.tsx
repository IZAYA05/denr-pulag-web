import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import AuthSessionProvider from "@/components/providers/SessionProvider";
import EmployeeShell from "@/components/employee/EmployeeShell";
import EmployeeDashboardClient from "@/components/employee/EmployeeDashboardClient";

type EmployeeLayoutProps = {
  children: React.ReactNode;
};

export default async function EmployeeLayout({
  children,
}: EmployeeLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "EMPLOYEE") {
    switch (session.user.role) {
      case "ADMIN":
        redirect("/admin");
      case "ORGANIZER":
        redirect("/organizer");
      default:
        redirect("/user");
    }
  }

  const accessToken = session.user.accessToken;

  if (!accessToken) {
    redirect("/login");
  }

  return (
    <AuthSessionProvider>
      <EmployeeDashboardClient accessToken={accessToken}>
        <EmployeeShell>{children}</EmployeeShell>
      </EmployeeDashboardClient>
    </AuthSessionProvider>
  );
}
