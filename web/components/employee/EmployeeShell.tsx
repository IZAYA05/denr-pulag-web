"use client";

import { useState } from "react";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import EmployeeTopbar from "@/components/employee/EmployeeTopbar";

type EmployeeShellProps = {
  children: React.ReactNode;
};

export default function EmployeeShell({
  children,
}: EmployeeShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <EmployeeSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "lg:ml-[88px]" : "lg:ml-[280px]"
        }`}
      >
        <EmployeeTopbar setIsOpen={setIsOpen} />

        <main className="p-4 md:p-6">
          <div className="w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
