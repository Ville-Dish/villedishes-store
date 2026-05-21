"use client";

import { Suspense } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { RevenueGrowth } from "./revenue-growth";
import { ProductPerformance } from "./product-performance";

interface PerformanceTabProps {
  selectedYear: number;
}

export const PerformanceTab = ({ selectedYear }: PerformanceTabProps) => {
  const trpc = useTRPC();

  const { data, isFetching } = useSuspenseQuery(
    trpc.dashboard.performanceMetricsData.queryOptions({
      year: selectedYear,
    }),
  );


  return (
    <div className="grid gap-4">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Revenue Growth</CardTitle>
        </CardHeader>
        <CardContent className="h-100 sm:h-112.5 md:h-125">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="h-full animate-pulse bg-gray-200 rounded" />
              }
            >
              <RevenueGrowth data={data.revenueGrowthData} />
            </Suspense>
          </ErrorBoundary>
        </CardContent>
      </Card>
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Product Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-100 sm:h-112.5 md:h-125">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="h-full animate-pulse bg-gray-200 rounded" />
              }
            >
              <ProductPerformance data={data.productPerformanceData} />
            </Suspense>
          </ErrorBoundary>
        </CardContent>
      </Card>
    </div>
  );
};
