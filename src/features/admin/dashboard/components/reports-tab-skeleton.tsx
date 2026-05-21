import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ReportAccordionRowSkeleton = () => (
  <div className="border rounded-md px-4 py-3 flex items-center justify-between">
    <div className="flex flex-col gap-1.5 flex-1">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-28" />
    </div>
    <Skeleton className="h-8 w-24 rounded-md" />
  </div>
);

const ReportSectionSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-5 w-32 mb-3" />
    {Array.from({ length: 3 }).map((_, i) => (
      <ReportAccordionRowSkeleton key={i} />
    ))}
  </div>
);

export const ReportsTabSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
        <CardDescription>View and download your reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <ReportSectionSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  );
};
