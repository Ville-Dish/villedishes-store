"use client";

import { useState, Suspense, useCallback } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AnalyticsPieChart } from "./pie-chart";
import { SettingsProgress } from "../../components/settings/progress";

type category = {
  category: string;
  amount: number;
};

interface AnalyticsTabProps {
  selectedYear: number;
  selectedMonth: number;
}

export const AnalyticsTab = ({
  selectedMonth,
  selectedYear,
}: AnalyticsTabProps) => {
  const trpc = useTRPC();

  const { data, isFetching } = useSuspenseQuery(
    trpc.dashboard.analyticsChartData.queryOptions({
      year: selectedYear,
      month: selectedMonth,
    }),
  );

  const yearlyRevenueData = data?.yearlyRevenueData ?? {
    projected: 0,
    actual: 0,
  };
  const monthlyRevenueData = data?.monthlyRevenueData ?? {
    projected: 0,
    actual: 0,
  };
  const profitData = data?.profitData ?? { totalRevenue: 0, profit: 0 };
  const incomeData = data?.incomeData ?? [];
  const expenseData = data?.expenseData ?? [];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Year Revenue Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsProgress
            value={
              yearlyRevenueData.projected
                ? (yearlyRevenueData.actual / yearlyRevenueData.projected) * 100
                : 0
            }
          />
          <p className="text-sm text-gray-500">
            {yearlyRevenueData.actual && yearlyRevenueData.projected ? (
              <>
                {(
                  (yearlyRevenueData.actual / yearlyRevenueData.projected) *
                  100
                ).toFixed(2)}
                % of yearly target ($
                {yearlyRevenueData.actual.toLocaleString()} / $
                {yearlyRevenueData.projected.toLocaleString()})
              </>
            ) : (
              "No revenue data available"
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Month Revenue Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-75 sm:h-87.5 lg:h-100">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="h-full animate-pulse bg-gray-200 rounded" />
              }
            >
              <AnalyticsPieChart variant="Revenue" data={monthlyRevenueData} />
            </Suspense>
          </ErrorBoundary>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1">
        <CardHeader>
          <CardTitle>Expense Chart</CardTitle>
        </CardHeader>
        <CardContent className="h-75 sm:h-87.5 lg:h-100">
          <AnalyticsPieChart variant="Expense" data={expenseData} />
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1">
        <CardHeader>
          <CardTitle>Income Chart</CardTitle>
        </CardHeader>
        <CardContent className="h-75 sm:h-87.5 lg:h-100">
          <AnalyticsPieChart variant="Income" data={incomeData} />
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1">
        <CardHeader>
          <CardTitle>Profit Chart</CardTitle>
        </CardHeader>
        <CardContent className="h-75 sm:h-87.5 lg:h-100">
          <AnalyticsPieChart variant="Profit" data={profitData} />
        </CardContent>
      </Card>
    </div>
  );
};
