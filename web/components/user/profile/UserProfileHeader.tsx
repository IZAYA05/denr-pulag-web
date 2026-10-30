import { UserRound } from "lucide-react";

type UserProfileHeaderProps = {
  name: string;
};

export default function UserProfileHeader({
  name,
}: UserProfileHeaderProps) {
  const initial = name.charAt(0).toUpperCase() || "U";

  return (
    <section className="rounded-3xl bg-emerald-950 px-6 py-8 text-white sm:px-8">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-2xl font-bold">
          {initial}
        </div>

        <div>
          <p className="text-sm text-emerald-200">
            Account Settings
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-emerald-100/80">
            View your account information.
          </p>
        </div>
      </div>
    </section>
  );
}