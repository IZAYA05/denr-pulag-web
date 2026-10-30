"use client";

import { useSession } from "next-auth/react";
import UserProfileHeader from "@/components/user/profile/UserProfileHeader";
import UserProfileCard from "@/components/user/profile/UserProfileCard";
import UserProfileLoading from "@/components/user/profile/UserProfileLoading";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <UserProfileLoading />;

  const name = session?.user?.name || "User";
  const email = session?.user?.email || "Not provided";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <UserProfileHeader name={name} />
      <UserProfileCard name={name} email={email} />
      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
        E-PULAG · Mount Pulag Booking System
      </p>
    </div>
  );
}