"use client";

import Link from "next/link";
import {
  DollarSign,
  CreditCard,
  FileText,
  ClockArrowUp,
  TriangleAlert,
  ClockAlert,
  CircleX,
} from "lucide-react";

import { RevenueGrowth } from "@/components/custom/dashboard/revenue-growth";
import { ProductPerformance } from "@/components/custom/dashboard/product-performance";
import { RecentOrders } from "@/components/custom/dashboard/recent-orders";
import { Overview } from "@/components/custom/dashboard/overview";
import { ReportsSection } from "@/components/custom/dashboard/report-accordion";
import { DatePickerWithRange } from "@/components/custom/date-range-picker";
import { YearPicker } from "@/components/custom/dashboard/year-picker";
import { MonthYearPicker } from "@/components/custom/dashboard/month-year-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { subDays, format, parse, isBefore, isSameMonth } from "date-fns";

type overview = {
  month: string;
  total: string;
};

type revenue = {
  month: string;
  revenue: number;
};

type quarterly = {
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
};

type quarterlyPerformance = {
  quarter: number;
  sales: number;
  orders: number;
  customerSatisfaction: number;
};

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}> = ({ title, value, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const quarterNames = ["Q1", "Q2", "Q3", "Q4"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedReportYear, setSelectedReportYear] = useState(
    new Date().getFullYear()
  );

  //Setting useStates for database data
  const [adminDashboardOverviewData, setAdminDashboardOverviewData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    unverifiedOrders: 0,
    pendingOrders: 0,
    totalInvoices: 0,
    unpaidInvoices: 0,
    dueInvoices: 0,
    recentOrders: [],
  });

  const [adminDashboardAnalyticsData, setAdminDashboardAnalyticsData] =
    useState({
      overviewData: [],
      revenueGrowthData: [],
      productPerformanceData: [],
    });

  const [adminDashboardReportData, setAdminDashboardReportData] = useState<
    ReportData[]
  >([]);

  //get quarter
  const getQuarter = (month: number) => {
    return Math.min(Math.floor((month - 1) / 3) + 1, 4);
  };

  const fetchOverviewData = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    const fromDate = format(dateRange.from, "yyyy-MM-dd");
    const toDate = format(dateRange.to, "yyyy-MM-dd");

    try {
      const [ordersResponse, invoicesResponse] = await Promise.all([
        fetch(
          `/api/dashboard/orders?limit=5&startDate=${fromDate}&endDate=${toDate}`
        ),
        fetch(
          `/api/dashboard/invoices?startDate=${fromDate}&endDate=${toDate}`
        ),
      ]);

      if (!ordersResponse.ok || !invoicesResponse.ok) {
        throw new Error("Failed to fetch overview data");
      }

      const ordersData = await ordersResponse.json();
      const invoicesData = await invoicesResponse.json();

      console.log({ ordersData });
      console.log({ invoicesData });

      setAdminDashboardOverviewData({
        totalRevenue:
          (ordersData.totalOrderRevenue || 0) +
          (invoicesData.totalInvoiceRevenue || 0),
        totalOrders: ordersData.totalOrders || 0,
        unverifiedOrders: ordersData.unverifiedOrders || 0,
        pendingOrders: ordersData.pendingOrders || 0,
        totalInvoices: invoicesData.totalInvoices || 0,
        unpaidInvoices: invoicesData.unpaidInvoices || 0,
        dueInvoices: invoicesData.dueInvoices || 0,
        recentOrders: ordersData.recentOrders || [],
      });
    } catch (error) {
      console.error("Error fetching overview data:", error);
    }
  }, [dateRange]);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/dashboard/overview?year=${selectedYear}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();

      const transformedOverviewData = (data.overviewData || []).map(
        (item: overview) => ({
          name: monthNames[parseInt(item.month) - 1],
          total: item.total,
        })
      );

      const transformedRevenueGrowthData = (data.revenueGrowthData || []).map(
        (item: revenue) => ({
          name: monthNames[parseInt(item.month) - 1],
          revenue: item.revenue,
        })
      );

      setAdminDashboardAnalyticsData({
        overviewData: transformedOverviewData,
        revenueGrowthData: transformedRevenueGrowthData,
        productPerformanceData: data.productPerformanceData || [],
      });
    } catch (error) {
      console.error("Error fetching analytics data: ", error);
    }
  }, [selectedYear]);

  const fetchReportData = useCallback(async () => {
    try {
      const [
        monthlySalesResponse,
        quarterlyFinancialsResponse,
        annualPerformanceResponse,
      ] = await Promise.all([
        fetch(
          `/api/dashboard/monthly-sales?year=${selectedReportYear}&month=${selectedMonth}`
        ),
        fetch(
          `/api/dashboard/quarterly-financials?year=${selectedReportYear}&quarter=${getQuarter(
            selectedMonth
          )}`
        ),
        fetch(`/api/dashboard/annual-performance?year=${selectedReportYear}`),
      ]);

      if (
        !monthlySalesResponse.ok ||
        !quarterlyFinancialsResponse.ok ||
        !annualPerformanceResponse.ok
      ) {
        throw new Error("Failed to fetch reports data");
      }

      const monthlySalesData = await monthlySalesResponse.json();
      const quarterlyFinancialsData = await quarterlyFinancialsResponse.json();
      const annualPerformanceData = await annualPerformanceResponse.json();

      //get report status
      const getReportStatus = (date: string) => {
        const currentDate = new Date();
        const reportDate = parse(date, "MMMM yyyy", new Date());

        if (
          isBefore(reportDate, currentDate) &&
          !isSameMonth(reportDate, currentDate)
        ) {
          return "Completed";
        } else if (isSameMonth(reportDate, currentDate)) {
          return "In Progress";
        } else {
          return "Unavailable";
        }
      };

      //setting adminDashboardReport
      setAdminDashboardReportData([
        {
          type: "Monthly Sales Report",
          items: [
            {
              date: `${monthNames[selectedMonth - 1]} ${selectedReportYear}`,
              status: getReportStatus(
                `${monthNames[selectedMonth - 1]} ${selectedReportYear}`
              ),
              monthlySalesReport: {
                monthlySales: monthlySalesData.monthlySales || [],
                topProducts: monthlySalesData.topProductData || [],
              },
            },
          ],
        },
        {
          type: "Quarterly Financials Report",
          items: [
            {
              date: `Q${getQuarter(selectedMonth)} ${selectedReportYear}`,
              status: getReportStatus(
                `${monthNames[selectedMonth - 1]} ${selectedReportYear}`
              ),
              quarterlyReport: {
                quarterlyData: (
                  quarterlyFinancialsData.quarterlyData || []
                ).map((item: quarterly) => ({
                  month: monthNames[item.month - 1],
                  revenue: item.revenue || 0,
                  expenses: item.expenses || 0,
                  profit: item.profit || 0,
                })),
                expenseBreakdown:
                  quarterlyFinancialsData.expenseBreakdown || [],
              },
            },
          ],
        },
        {
          type: "Annual Performance Report",
          items: [
            {
              date: selectedReportYear.toString(),
              status: getReportStatus(`December ${selectedReportYear}`),
              annualPerformance: {
                quarterlyPerformance: (
                  annualPerformanceData.quarterlyPerformance || []
                ).map((item: quarterlyPerformance) => ({
                  quarter: quarterNames[item.quarter - 1],
                  sales: item.sales || 0,
                  target: item.orders || 0,
                  customerSatisfaction: item.customerSatisfaction || 0,
                })),
                keyMetrics: annualPerformanceData.keyMetrics || [],
              },
            },
          ],
        },
      ]);
    } catch (error) {
      console.error("Error fetching reports data: ", error);
    }
  }, [selectedMonth, selectedReportYear]);

  //fetching data from db
  useEffect(() => {
    if (activeTab === "overview") {
      fetchOverviewData();
    } else if (activeTab === "analytics") {
      fetchAnalyticsData();
    } else if (activeTab === "reports") {
      fetchReportData();
    }
  }, [activeTab, fetchOverviewData, fetchAnalyticsData, fetchReportData]);

  const renderDatePicker = () => {
    switch (activeTab) {
      case "overview":
        return (
          <DatePickerWithRange
            date={dateRange}
            setDate={(newDateRange) => {
              setDateRange(newDateRange);
              if (newDateRange?.from && newDateRange?.to) {
                fetchOverviewData();
              }
            }}
          />
        );
      case "analytics":
        return (
          <YearPicker
            selectedYear={selectedYear}
            onYearChange={(newYear) => {
              setSelectedYear(newYear);
              fetchAnalyticsData();
            }}
          />
        );
      case "reports":
        return (
          <MonthYearPicker
            selectedMonth={selectedMonth}
            selectedYear={selectedReportYear}
            onMonthChange={(newMonth) => {
              setSelectedMonth(newMonth);
              fetchReportData();
            }}
            onYearChange={(newYear) => {
              setSelectedReportYear(newYear);
              fetchReportData();
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
        <div className="flex items-center space-x-2">
          {renderDatePicker()}
          {/* <Button onClick={filterData}>Filter</Button> */}
        </div>
      </div>
      <Tabs
        defaultValue="overview"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        {/* Overview Tab View */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={`$${
                adminDashboardOverviewData.totalRevenue.toFixed(2) ?? "0.00"
              }`}
              icon={DollarSign}
            />
            <StatCard
              title="Total Orders"
              value={adminDashboardOverviewData.totalOrders.toString() ?? "0"}
              icon={CreditCard}
            />
            <StatCard
              title="Unverified Orders"
              value={
                adminDashboardOverviewData.unverifiedOrders.toString() ?? "0"
              }
              icon={TriangleAlert}
            />
            <StatCard
              title="Pending Orders"
              value={adminDashboardOverviewData.pendingOrders.toString() ?? "0"}
              icon={ClockArrowUp}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total Invoices"
              value={adminDashboardOverviewData.totalInvoices.toString() ?? "0"}
              icon={FileText}
            />
            <StatCard
              title="Unpaid Invoices"
              value={
                adminDashboardOverviewData.unpaidInvoices.toString() ?? "0"
              }
              icon={CircleX}
            />
            <StatCard
              title="Due Invoices"
              value={adminDashboardOverviewData.dueInvoices.toString() ?? "0"}
              icon={ClockAlert}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Your most recent order activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentOrders
                  data={adminDashboardOverviewData.recentOrders ?? []}
                />
              </CardContent>
              <CardFooter className="flex justify-center">
                <Link href="/admin/orders" passHref>
                  <Button className="w-full sm:w-auto">View All Orders</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        {/* Analytics Tab View */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Order Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {/* <Overview data={filteredOverviewData} /> */}
                <Overview data={adminDashboardAnalyticsData.overviewData} />
              </CardContent>
            </Card>
            <Card className="col-span-3 md:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                {/* <RevenueGrowth data={filteredRevenueData} /> */}
                <RevenueGrowth
                  data={adminDashboardAnalyticsData.revenueGrowthData}
                />
              </CardContent>
            </Card>
            <Card className="col-span-3 md:col-span-1">
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {/* <ProductPerformance data={filteredProductData} /> */}
                <ProductPerformance
                  data={adminDashboardAnalyticsData.productPerformanceData}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* Report Tab View */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View and download your reports</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsSection data={adminDashboardReportData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
