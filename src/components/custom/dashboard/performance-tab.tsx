"use client";

import { useState, Suspense, useCallback } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";

import { RevenueGrowth } from "@/components/custom/dashboard/revenue-growth";
import { ProductPerformance } from "@/components/custom/dashboard/product-performance";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PerformanceTabProps {
  data: {
    revenueGrowthData: never[];
    productPerformanceData: never[];
  };
}

export const PerformanceTab = ({ data }: PerformanceTabProps) => {
  return (
    <div className="grid gap-4">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Revenue Growth</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] sm:h-[450px] md:h-[500px]">
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
        <CardContent className="h-[400px] sm:h-[450px] md:h-[500px]">
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
