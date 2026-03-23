import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const AnalyticsPieChartSkeleton = () => (
  <div className="flex flex-col items-center justify-center h-full gap-4">
    <Skeleton className="rounded-full h-40 w-40 sm:h-52 sm:w-52" />
    <div className="flex flex-col gap-2 w-full max-w-xs">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </div>
);

export const AnalyticsTabSkeleton = () => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Year Revenue Progress */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-4 w-72" />
        </CardContent>
      </Card>

      {/* Month Revenue Performance */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <Skeleton className="h-6 w-56" />
        </CardHeader>
        <CardContent className="h-75 sm:h-87.5 lg:h-100">
          <AnalyticsPieChartSkeleton />
        </CardContent>
      </Card>

      {/* Expense Chart */}
      <Card className="col-span-1 md:col-span-1">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="h-75 sm:h-87.5 lg:h-100">
          <AnalyticsPieChartSkeleton />
        </CardContent>
      </Card>

      {/* Income Chart */}
      <Card className="col-span-1 md:col-span-1">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="h-75 sm:h-87.5 lg:h-100">
          <AnalyticsPieChartSkeleton />
        </CardContent>
      </Card>

      {/* Profit Chart */}
      <Card className="col-span-1 md:col-span-1">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="h-75 sm:h-87.5 lg:h-100">
          <AnalyticsPieChartSkeleton />
        </CardContent>
      </Card>
    </div>
  );
};
