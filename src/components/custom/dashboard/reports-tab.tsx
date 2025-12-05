"use client";

import { useState, Suspense, useCallback } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ReportsSection } from "@/components/custom/dashboard/report-accordion";

type ReportData = {
  type: string;
  items: ReportItem[];
};

interface ReportTabProps {
  data: ReportData[];
}
export const ReportsTab = ({ data }: ReportTabProps) => {
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
