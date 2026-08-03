"use client";

import Link from "next/link";
import { Bell, Settings } from "lucide-react";

export default function UserNavbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/30 backdrop-blur-lg">
      <div className="mx-auto flex h-20 items-center justify-between px-8">

        <h1 className="text-2xl font-bold text-emerald-400">
          E-PULAG User
        </h1>

        <div className="flex items-center gap-4">

          <button
            className="rounded-xl border border-emerald-700 p-3 font-semibold text-emerald-400 transition-all duration-200 hover:bg-emerald-500 hover:text-black"
          >
            <Bell size={18} />
          </button>

          <Link
            href="/User/settings"
            className="flex items-center gap-2 rounded-xl border border-emerald-500 px-5 py-2 font-semibold text-emerald-400 transition-all duration-200 hover:bg-emerald-500 hover:text-black"
          >
            <Settings size={18} />
            Settings
          </Link>

          <button
            className="flex items-center gap-2 rounded-xl border border-emerald-500 px-5 py-2 font-semibold text-emerald-400 transition-all duration-200 hover:bg-emerald-500 hover:text-black"
          >
            Logout
          </button>

        </div>

      </div>
    </nav>
  );
}