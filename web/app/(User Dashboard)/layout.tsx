import AuthSessionProvider from "@/components/providers/SessionProvider";
import UserShell from "@/components/user/UserShell";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthSessionProvider>
      <UserShell>{children}</UserShell>
    </AuthSessionProvider>
  );
}
