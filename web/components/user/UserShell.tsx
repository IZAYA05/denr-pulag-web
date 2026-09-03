"use client";

import { useState } from "react";

import UserSidebar from "@/components/user/UserSidebar";
import UserTopbar from "@/components/user/UserTopbar";

type UserShellProps = {
  children: React.ReactNode;
};

export default function UserShell({
  children,
}: UserShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <UserSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <div
        className={`
          min-h-screen transition-all duration-300
          ${collapsed ? "lg:ml-[88px]" : "lg:ml-[280px]"}
        `}
      >
        <UserTopbar setIsOpen={setIsOpen} />

        <main className="p-6">
          <div className="w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}