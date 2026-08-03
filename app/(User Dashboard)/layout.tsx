import UserNavbar from "./layout/UserNavbar";
import UserSidebar from "./layout/UserSidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <UserNavbar />

      <div className="flex pt-20">
        <UserSidebar />

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}