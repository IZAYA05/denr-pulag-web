"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Package } from "lucide-react";

import Card from "@/components/ui/Card";

type OrganizerPackage = {
  id: number;
  name: string;
  price: string | number;
  status: string;
  approval_status?: string;
  max_tourists: number;
};
type ApiResponse = { packages?: OrganizerPackage[]; message?: string };
const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

function formatPrice(value: string | number) {
  const amount = Number(value);
  return Number.isFinite(amount) ? new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount) : "Price unavailable";
}

export default function OrganizerMyPackages() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const [packages, setPackages] = useState<OrganizerPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    async function load() {
      try {
        const response = await fetch(`${API_URL}/api/organizer/packages`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        });
        const data = (await response.json()) as ApiResponse;
        if (!response.ok) throw new Error(data.message || "Unable to load packages.");
        if (active) setPackages((data.packages || []).slice(0, 5));
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "Unable to load packages.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [accessToken]);

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">My Packages</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Your organizer package submissions and approval status.</p>
        </div>
        <Link href="/organizer/packages" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:gap-2">Manage <ArrowRight className="h-4 w-4" /></Link>
      </div>
      {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
      {loading ? <p className="py-8 text-center text-sm text-zinc-500">Loading packages...</p> : packages.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <Package className="h-9 w-9 text-zinc-300 dark:text-zinc-700" />
          <p className="mt-3 font-semibold text-zinc-800 dark:text-zinc-200">No packages yet</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Create a package to submit it for DENR approval.</p>
          <Link href="/organizer/packages" className="mt-4 text-sm font-semibold text-emerald-600">Create a package</Link>
        </div>
      ) : (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {packages.map((item) => {
            const approval = (item.approval_status || "APPROVED").toUpperCase();
            return (
              <div key={item.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">{item.name}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{formatPrice(item.price)} · Up to {item.max_tourists} tourists</p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${approval === "APPROVED" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300" : approval === "REJECTED" ? "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-300" : "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"}`}>
                  {approval === "APPROVED" ? "DENR Approved" : approval === "REJECTED" ? "DENR Rejected" : "Awaiting DENR"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
