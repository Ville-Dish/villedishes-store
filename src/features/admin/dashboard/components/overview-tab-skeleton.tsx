import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-4 rounded" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-24" />
    </CardContent>
  </Card>
);

const RecentOrdersRowSkeleton = () => (
  <div className="flex items-center justify-between py-3 border-b last:border-b-0">
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
    <div className="flex flex-col items-end gap-1.5">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
  </div>
);

export const OverviewTabSkeleton = () => {
  return (
    <>
      {/* Row 1: 4 stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Row 2: 3 stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Recent Orders */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your most recent order activity</CardDescription>
          </CardHeader>
          <CardContent>
            {Array.from({ length: 5 }).map((_, i) => (
              <RecentOrdersRowSkeleton key={i} />
            ))}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Skeleton className="h-10 w-36 rounded-md" />
          </CardFooter>
        </Card>
      </div>
    </>
  );
};
