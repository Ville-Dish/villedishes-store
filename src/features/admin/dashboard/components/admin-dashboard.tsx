"use client";

import { Suspense, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DatePickerWithRange } from "@/components/custom/date-range-picker";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns/subDays";

import { OverviewTab } from "@/features/admin/dashboard/components/overview-tab";
import { PerformanceTab } from "@/features/admin/dashboard/components/performance-tab";
import { YearPicker } from "@/features/admin/dashboard/components/year-picker";
import { MonthYearPicker } from "@/features/admin/dashboard/components/month-year-picker";
import { AnalyticsTab } from "@/features/admin/dashboard/components/analytics-tab";
import { ReportsTab } from "@/features/admin/dashboard/components/reports-tab";
import { OverviewTabSkeleton } from "@/features/admin/dashboard/components/overview-tab-skeleton";
import { PerformanceTabSkeleton } from "@/features/admin/dashboard/components/performance-tab-skeleton";
import { AnalyticsTabSkeleton } from "@/features/admin/dashboard/components/analytics-tab-skeleton";
import { ReportsTabSkeleton } from "@/features/admin/dashboard/components/reports-tab-skeleton";
import { useDashboardParams } from "../hooks/use-dashboard-params";

export const AdminDashboard = () => {
  const [params, setParams] = useDashboardParams();
  const {
    tab: activeTab,
    startDate,
    endDate,
    selectedYear,
    selectedAnalyticsMonth,
    selectedAnalyticsYear,
    selectedReportMonth: selectedMonth,
    selectedReportYear,
  } = params;

  // For the DatePicker UI only
  const dateRange: DateRange | undefined = {
    from: startDate,
    to: endDate,
  };

  const handleDateChange = (newRange: DateRange | undefined) => {
    setParams({
      startDate: newRange?.from ?? startDate,
      endDate: newRange?.to ?? endDate,
    });
  };

  //Figure out why data is slow to display when YearPicker value changes
  const renderDatePicker = () => {
    switch (activeTab) {
      case "overview":
        return (
          <DatePickerWithRange date={dateRange} setDate={handleDateChange} />
        );
      case "performance":
        return (
          <YearPicker
            selectedYear={selectedYear}
            onYearChange={(newYear) => {
              setParams({ selectedYear: newYear });
            }}
          />
        );
      case "analytics":
        return (
          <MonthYearPicker
            selectedMonth={selectedAnalyticsMonth}
            selectedYear={selectedAnalyticsYear}
            onMonthChange={(newMonth) => {
              setParams({ selectedAnalyticsMonth: newMonth });
            }}
            onYearChange={(newYear) => {
              setParams({ selectedAnalyticsYear: newYear });
            }}
          />
        );
      case "reports":
        return (
          <YearPicker
            selectedYear={selectedReportYear}
            onYearChange={(newYear) => {
              setParams({ selectedReportYear: newYear });
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">{renderDatePicker()}</div>
      </div>
      <Tabs
        value={activeTab}
        className="space-y-4"
        onValueChange={(value) => setParams({ tab: value })}
      >
        <TabsList className="w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<OverviewTabSkeleton />}>
            <OverviewTab dateFrom={startDate} dateTo={endDate} />
          </Suspense>
        </TabsContent>
        <TabsContent value="performance" className="space-y-4">
          <Suspense fallback={<PerformanceTabSkeleton />}>
            <PerformanceTab selectedYear={selectedYear} />
          </Suspense>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Suspense fallback={<AnalyticsTabSkeleton />}>
            <AnalyticsTab
              selectedMonth={selectedAnalyticsMonth}
              selectedYear={selectedAnalyticsYear}
            />
          </Suspense>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Suspense fallback={<ReportsTabSkeleton />}>
            <ReportsTab selectedYear={selectedReportYear} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};
