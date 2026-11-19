"use client";

import ActivityLogs from "@/components/activity-logs/ActivityLogs";
import { useDashboard } from "@/components/admin/DashboardClient";

export default function AdminActivityLogsPage() {
  const { accessToken } = useDashboard();

  return <ActivityLogs accessToken={accessToken} viewerRole="ADMIN" />;
}
