"use client";

import { useRouter } from "next/navigation";
import BrowsePackages from "@/components/user/packages/BrowsePackages";

export default function UserPage() {
  const router = useRouter();

  return (
    <BrowsePackages
      onSelectPackage={(pkg) => {
        router.push(`/user/book?packageId=${pkg.id}`);
      }}
    />
  );
}

