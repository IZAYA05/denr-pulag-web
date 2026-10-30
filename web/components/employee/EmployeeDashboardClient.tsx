"use client";

import { createContext, useContext } from "react";

type EmployeeDashboardContextType = {
  accessToken: string;
};

const EmployeeDashboardContext =
  createContext<EmployeeDashboardContextType | null>(null);

export function useEmployeeDashboard() {
  const context = useContext(EmployeeDashboardContext);

  if (!context) {
    throw new Error(
      "useEmployeeDashboard must be used inside EmployeeDashboardClient."
    );
  }

  return context;
}

type EmployeeDashboardClientProps = {
  children: React.ReactNode;
  accessToken: string;
};

export default function EmployeeDashboardClient({
  children,
  accessToken,
}: EmployeeDashboardClientProps) {
  return (
    <EmployeeDashboardContext.Provider value={{ accessToken }}>
      {children}
    </EmployeeDashboardContext.Provider>
  );
}
