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
import { ReportItem } from "@/lib/types";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ReportsSection } from "./report-accordion";

type ReportData = {
  type: string;
  items: ReportItem[];
};

interface ReportTabProps {
  selectedYear: number;
  selectedMonth: number;
}
export const ReportsTab = ({ selectedMonth, selectedYear }: ReportTabProps) => {
  const trpc = useTRPC();

  const { data = [] } = useSuspenseQuery(
    trpc.dashboard.reportData.queryOptions({
      year: selectedYear,
      month: selectedMonth,
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
