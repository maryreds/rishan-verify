import { AnalyticsDashboardClient } from "@/components/dashboard/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          See who is viewing your profile and which skills attract the most attention.
        </p>
      </div>
      <AnalyticsDashboardClient />
    </div>
  );
}
