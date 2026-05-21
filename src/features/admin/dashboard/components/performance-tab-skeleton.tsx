import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const ChartSkeleton = () => (
  <div className="flex flex-col justify-end gap-2 h-full w-full">
    {/* Y-axis labels + bars */}
    <div className="flex items-end gap-3 h-full px-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t-sm"
          style={{ height: `${30 + Math.round(Math.random() * 60)}%` }}
        />
      ))}
    </div>
    {/* X-axis labels */}
    <div className="flex gap-3 px-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="flex-1 h-3 rounded" />
      ))}
    </div>
  </div>
);

export const PerformanceTabSkeleton = () => {
  return (
    <div className="grid gap-4">
      {/* Revenue Growth */}
      <Card className="col-span-full">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="h-100 sm:h-112.5 md:h-125">
          <ChartSkeleton />
        </CardContent>
      </Card>

      {/* Product Performance */}
      <Card className="col-span-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="h-100 sm:h-112.5 md:h-125">
          <ChartSkeleton />
        </CardContent>
      </Card>
    </div>
  );
};
