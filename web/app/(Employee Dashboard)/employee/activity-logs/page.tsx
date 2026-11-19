"use client";

import ActivityLogs from "@/components/activity-logs/ActivityLogs";
import { useEmployeeDashboard } from "@/components/employee/EmployeeDashboardClient";

export default function EmployeeActivityLogsPage() {
  const { accessToken } = useEmployeeDashboard();

  return <ActivityLogs accessToken={accessToken} viewerRole="EMPLOYEE" />;
}
