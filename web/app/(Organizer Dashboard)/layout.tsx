import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import AuthSessionProvider from "@/components/providers/SessionProvider";
import OrganizerShell from "@/components/organizer/OrganizerShell";

type OrganizerLayoutProps = {
  children: React.ReactNode;
};

export default async function OrganizerLayout({
  children,
}: OrganizerLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (
    session.user.role !==
    "ORGANIZER"
  ) {
    redirect("/user");
  }

  const accessToken =
    session.user.accessToken;

  if (!accessToken) {
    redirect("/login");
  }

  return (
    <AuthSessionProvider>
      <OrganizerShell>
        {children}
      </OrganizerShell>
    </AuthSessionProvider>
  );
}