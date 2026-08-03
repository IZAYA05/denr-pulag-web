"use client";

import { useState } from "react";

import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      {/* Main Content */}

      <div
        className={`
          min-h-screen
          transition-all
          duration-300
          bg-500/20

          ${collapsed ? "lg:ml-[88px]" : "lg:ml-[280px]"}
        `}
      >
        {/* Topbar */}

        <Topbar setIsOpen={setIsOpen} />

        {/* Page Content */}

        <main className="p-6">
                    <div className="w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}