"use client";

import {
  createContext,
  useContext,
} from "react";

type DashboardContextType = {
  accessToken: string;
};

const DashboardContext =
  createContext<DashboardContextType | null>(null);

export function useDashboard() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error(
      "useDashboard must be used inside DashboardClient."
    );
  }

  return context;
}

type DashboardClientProps = {
  children: React.ReactNode;
  accessToken: string;
};

export default function DashboardClient({
  children,
  accessToken,
}: DashboardClientProps) {
  return (
    <DashboardContext.Provider
      value={{ accessToken }}
    >
      {children}
    </DashboardContext.Provider>
  );
}