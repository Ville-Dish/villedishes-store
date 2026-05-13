//app/admin/(dashboard)/dashboard/page.tsx

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminDashboard } from "@/features/admin/dashboard/components/admin-dashboard";
import { dashboardParamsLoader } from "@/features/admin/dashboard/params";
import {
  normalizeEndDate,
  normalizeStartDate,
} from "@/features/admin/dashboard/utils";
import { requireAuth } from "@/lib/session/server-session";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { SearchParams } from "nuqs/server";

type Props = {
  searchParams: Promise<SearchParams>;
};

const AdminDashboardPage = async ({ searchParams }: Props) => {
  await requireAuth();

  const {
    startDate,
    endDate,
    selectedAnalyticsMonth,
    selectedAnalyticsYear,
    selectedReportYear,
    selectedYear,
  } = await dashboardParamsLoader(searchParams);

  prefetch(
    trpc.dashboard.overviewData.queryOptions({
      startDate: normalizeStartDate(startDate),
      endDate: normalizeEndDate(endDate),
      limit: 5,
    }),
  );

  prefetch(
    trpc.dashboard.analyticsChartData.queryOptions({
      year: selectedAnalyticsYear,
      month: selectedAnalyticsMonth,
    }),
  );

  prefetch(
    trpc.dashboard.performanceMetricsData.queryOptions({
      year: selectedYear,
    }),
  );

  prefetch(
    trpc.dashboard.reportData.queryOptions({
      year: selectedReportYear,
    }),
  );

  return (
    <HydrateClient>
      <ErrorBoundary>
        <AdminDashboard />
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default AdminDashboardPage;
