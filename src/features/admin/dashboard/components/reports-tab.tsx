"use client";

import { Suspense } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ReportsSection } from "./report-accordion";

interface ReportTabProps {
  selectedYear: number;
}
export const ReportsTab = ({ selectedYear }: ReportTabProps) => {
  const trpc = useTRPC();

  const { data = [] } = useSuspenseQuery(
    trpc.dashboard.reportData.queryOptions({
      year: selectedYear,
    }),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
        <CardDescription>View and download your reports</CardDescription>
      </CardHeader>
      <CardContent>
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="h-full animate-pulse bg-gray-200 rounded" />
            }
          >
            <ReportsSection data={data} />
          </Suspense>
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
};
