"use client";

import { useState } from "react";

import UserSidebar from "@/components/user/UserSidebar";
import UserTopbar from "@/components/user/UserTopbar";

type UserShellProps = {
  children: React.ReactNode;
};

export default function UserShell({ children }: UserShellProps) {
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
          min-h-screen min-w-0 transition-[margin] duration-300 ease-in-out
          ${collapsed ? "lg:ml-[88px]" : "lg:ml-[280px]"}
        `}
      >
        <UserTopbar setIsOpen={setIsOpen} />

        <main className="min-w-0 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
