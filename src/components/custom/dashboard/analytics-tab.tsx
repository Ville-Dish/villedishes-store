"use client";

import { useState, Suspense, useCallback } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { SettingsProgress } from "@/components/custom/settings/progress";
import { AnalyticsPieChart } from "@/components/custom/dashboard/pie-chart";

type category = {
  category: string;
  amount: number;
};

interface AnalyticsTabProps {
  data: {
    yearlyRevenueData: { projected: number; actual: number };
    monthlyRevenueData: { projected: number; actual: number };
    profitData: { totalRevenue: number; profit: number };
    incomeData: never[];
    expenseData: never[];
  };
}

export const AnalyticsTab = ({ data }: AnalyticsTabProps) => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Year Revenue Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsProgress
            value={
              (data.yearlyRevenueData.actual /
                data.yearlyRevenueData.projected) *
              100
            }
          />
          <p className="text-sm text-gray-500">
            {data.yearlyRevenueData.actual &&
            data.yearlyRevenueData.projected ? (
              <>
                {(
                  (data.yearlyRevenueData.actual /
                    data.yearlyRevenueData.projected) *
                  100
                ).toFixed(2)}
                % of yearly target ($
                {data.yearlyRevenueData.actual.toLocaleString()} / $
                {data.yearlyRevenueData.projected.toLocaleString()})
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
        <CardContent className="h-[300px] sm:h-[350px] lg:h-[400px]">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="h-full animate-pulse bg-gray-200 rounded" />
              }
            >
              <AnalyticsPieChart
                variant="Revenue"
                data={data.monthlyRevenueData}
              />
            </Suspense>
          </ErrorBoundary>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1">
        <CardHeader>
          <CardTitle>Expense Chart</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] sm:h-[350px] lg:h-[400px]">
          <AnalyticsPieChart variant="Expense" data={data.expenseData} />
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1">
        <CardHeader>
          <CardTitle>Income Chart</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] sm:h-[350px] lg:h-[400px]">
          <AnalyticsPieChart variant="Income" data={data.incomeData} />
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1">
        <CardHeader>
          <CardTitle>Profit Chart</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] sm:h-[350px] lg:h-[400px]">
          <AnalyticsPieChart variant="Profit" data={data.profitData} />
        </CardContent>
      </Card>
    </div>
  );
};
