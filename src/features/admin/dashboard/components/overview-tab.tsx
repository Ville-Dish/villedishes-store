"use client";

import { Suspense } from "react";
import Link from "next/link";
import { DateRange } from "react-day-picker";

import {
  CircleX,
  ClockAlert,
  ClockArrowUp,
  CreditCard,
  DollarSign,
  FileText,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { RecentOrders } from "./recent-orders";
import { normalizeEndDate, normalizeStartDate } from "../utils";

interface OverviewTabProps {
  dateFrom: Date;
  dateTo: Date;
}

export const OverviewTab = ({ dateFrom, dateTo }: OverviewTabProps) => {
  // Fetch dashboard data based on the selected date range
  const trpc = useTRPC();

  const { data, isFetching } = useSuspenseQuery(
    trpc.dashboard.overviewData.queryOptions({
      startDate: normalizeStartDate(dateFrom),
      endDate: normalizeEndDate(dateTo),
      limit: 5,
    }),
  );

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${
            data.totalRevenue.toLocaleString("en-US", {
              maximumFractionDigits: 2,
            }) ?? "0.00"
          }`}
          icon={DollarSign}
          isLoading={isFetching}
        />
        <StatCard
          title="Total Orders"
          value={data.totalOrders.toString() ?? "0"}
          icon={CreditCard}
          isLoading={isFetching}
        />
        <StatCard
          title="Unverified Orders"
          value={data.unVerifiedOrders.toString() ?? "0"}
          icon={TriangleAlert}
          isLoading={isFetching}
        />
        <StatCard
          title="Pending Orders"
          value={data.pendingOrders.toString() ?? "0"}
          icon={ClockArrowUp}
          isLoading={isFetching}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Invoices"
          value={data.totalInvoices.toString() ?? "0"}
          icon={FileText}
          isLoading={isFetching}
        />
        <StatCard
          title="Unpaid Invoices"
          value={data.unpaidInvoices.toString() ?? "0"}
          icon={CircleX}
          isLoading={isFetching}
        />
        <StatCard
          title="Due Invoices"
          value={data.dueInvoices.toString() ?? "0"}
          icon={ClockAlert}
          isLoading={isFetching}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your most recent order activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="h-full animate-pulse bg-gray-200 rounded" />
                }
              >
                <RecentOrders data={data.recentOrders ?? []} />
              </Suspense>
            </ErrorBoundary>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/admin/orders" passHref>
              <Button className="w-full sm:w-auto bg-[#fd9e1d]">
                View All Orders
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isLoading?: boolean;
}> = ({ title, value, icon: Icon, isLoading }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="h-8 w-24 animate-pulse bg-gray-200 rounded" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);
