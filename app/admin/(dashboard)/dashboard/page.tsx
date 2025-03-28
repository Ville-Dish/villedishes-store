//app/admin/(dashboard)/dashboard/page.tsx
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
import { subDays, format } from "date-fns";
import { SettingsProgress } from "@/components/custom/settings/progress";
import { AnalyticsPieChart } from "@/components/custom/dashboard/pie-chart";
import { useLoading } from "@/context/LoadingContext";

type revenue = {
  month: string;
  revenue: number;
};

type revenueModified = {
  name: string;
  revenue: number;
};

type category = {
  category: string;
  amount: number;
};

interface MonthlyData {
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ExpenseBreakdown {
  category: string;
  amount: number;
}

interface QuarterlyData {
  quarter: number;
  monthlyData: MonthlyData[];
}

interface QuarterlyExpenseBreakdown {
  quarter: number;
  data: ExpenseBreakdown[];
}

type QuarterlyReport = {
  monthlyData: QuarterlyData[];
  expenseBreakdown: QuarterlyExpenseBreakdown[];
};

type ReportItem = {
  date: string;
  status: string;
  action?: string;
  monthlySalesReport?: MonthlySalesReport;
  quarterlyReport?: QuarterlyReport;
  annualPerformance?: AnnualPerformance;
};

type ReportData = {
  type: string;
  items: ReportItem[];
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

export default function AdminDashboard() {
  const { setIsLoading } = useLoading(); // Use loading context
  const [isFetchingData, setIsFetchingData] = useState(false);

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
  const [selectedAnalyticsMonth, setSelectedAnalyticsMonth] = useState(
    new Date().getMonth() + 1
  );
  const [selectedAnalyticsYear, setSelectedAnalyticsYear] = useState(
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

  const [adminDashboardPerformanceData, setAdminDashboardPerformanceData] =
    useState({
      revenueGrowthData: [],
      productPerformanceData: [],
    });

  const [adminDashboardAnalyticsData, setAdminDashboardAnalyticsData] =
    useState({
      yearlyRevenueData: { projected: 0, actual: 0 },
      monthlyRevenueData: { projected: 0, actual: 0 },
      profitData: { totalRevenue: 0, profit: 0 },
      incomeData: [],
      expenseData: [],
    });

  const [adminDashboardReportData, setAdminDashboardReportData] = useState<
    ReportData[]
  >([]);

  //get quarter
  // const getQuarter = (month: number) => {
  //   return Math.min(Math.floor((month - 1) / 3) + 1, 4);
  // };

  const fetchOverviewData = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    setIsFetchingData(true);

    const fromDate = format(dateRange.from, "yyyy-MM-dd");
    const toDate = format(dateRange.to, "yyyy-MM-dd");

    try {
      const [ordersResponse, invoicesResponse, incomeResponse] =
        await Promise.all([
          fetch(
            `/api/dashboard/orders?limit=5&startDate=${fromDate}&endDate=${toDate}`
          ),
          fetch(
            `/api/dashboard/invoices?startDate=${fromDate}&endDate=${toDate}`
          ),
          fetch(
            `/api/dashboard/income?startDate=${fromDate}&endDate=${toDate}`
          ),
        ]);

      if (!ordersResponse.ok || !invoicesResponse.ok) {
        throw new Error("Failed to fetch overview data");
      }

      const ordersData = await ordersResponse.json();
      const invoicesData = await invoicesResponse.json();
      const incomeData = await incomeResponse.json();

      setAdminDashboardOverviewData({
        totalRevenue:
          (ordersData.totalOrderRevenue || 0) +
          (invoicesData.totalInvoiceRevenue || 0) +
          (incomeData.totalIncomeAmount || 0),
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
    } finally {
      setIsFetchingData(false);
    }
  }, [dateRange]);

  const fetchPerformanceData = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/dashboard/overview?year=${selectedYear}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      console.log({ data });

      const transformedRevenueGrowthData = (data.revenueGrowthData || [])
        .map((item: revenue) => ({
          name: item.month,
          revenue: item.revenue,
        }))
        .sort(
          (a: revenueModified, b: revenueModified) =>
            new Date(`${a.name} 1, 2024`).getMonth() -
            new Date(`${b.name} 1, 2024`).getMonth()
        );

      setAdminDashboardPerformanceData({
        revenueGrowthData: transformedRevenueGrowthData,
        productPerformanceData: data.productPerformanceData || [],
      });
    } catch (error) {
      console.error("Error fetching analytics data: ", error);
    }
  }, [selectedYear]);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/dashboard/revenue?year=${selectedAnalyticsYear}&month=${selectedAnalyticsMonth}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();

      const transformedIncomeData = (data.incomeData || []).map(
        (item: category) => ({
          category: item.category,
          value: item.amount,
        })
      );

      const transformedExpenseData = (data.expenseData || []).map(
        (item: category) => ({
          category: item.category,
          value: item.amount,
        })
      );

      const transformedProfit =
        data.profitData.profit < 0 ? 0 : data.profitData.profit;

      setAdminDashboardAnalyticsData({
        yearlyRevenueData: {
          projected: data.yearlyRevenueData.projected || 0,
          actual: data.yearlyRevenueData.actual || 0,
        },
        monthlyRevenueData: {
          projected: data.monthlyRevenueData.projected || 0,
          actual: data.monthlyRevenueData.actual || 0,
        },
        profitData: {
          totalRevenue: data.profitData.totalRevenue || 0,
          profit: transformedProfit || 0,
        },
        incomeData: transformedIncomeData || [],
        expenseData: transformedExpenseData || [],
      });
    } catch (error) {
      console.error("Error fetching analytics data: ", error);
    }
  }, [selectedAnalyticsYear, selectedAnalyticsMonth]);

  //figure out why data is not displaying properly
  // refactor so that when there is no data, it just shows no data and does not throw error
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
        fetch(`/api/dashboard/quarterly-financials?year=${selectedReportYear}`),
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
      const quarterlyFinancialsData: QuarterlyReport =
        await quarterlyFinancialsResponse.json();
      const annualPerformanceData = await annualPerformanceResponse.json();

      console.log({ monthlySalesData });
      console.log({ quarterlyFinancialsData });
      console.log({ annualPerformanceData });

      //get report status
      const getReportStatus = (date: string) => {
        const currentDate = new Date();
        const reportDate = new Date(date);
        if (reportDate < currentDate) return "Completed";
        if (
          reportDate.getMonth() === currentDate.getMonth() &&
          reportDate.getFullYear() === currentDate.getFullYear()
        )
          return "In Progress";
        return "Unavailable";
      };

      //setting adminDashboardReport
      setAdminDashboardReportData([
        {
          type: "Monthly Sales Report",
          items: [
            {
              date: `${monthNames[selectedMonth - 1]} ${selectedReportYear}`,
              status: getReportStatus(
                `${selectedReportYear}-${selectedMonth}-01`
              ),
              monthlySalesReport: monthlySalesData,
            },
          ],
        },
        {
          type: "Quarterly Financials Report",
          items: [
            {
              date: `${selectedReportYear}`,
              status: getReportStatus(`${selectedReportYear}-12-31`),
              quarterlyReport: quarterlyFinancialsData,
            },
          ],
        },
        {
          type: "Annual Performance Report",
          items: [
            {
              date: selectedReportYear.toString(),
              status: getReportStatus(`${selectedReportYear}-12-31`),
              annualPerformance: annualPerformanceData,
            },
          ],
        },
      ]);
    } catch (error) {
      console.error("Error fetching reports data: ", error);
      setAdminDashboardReportData([]);
    }
  }, [selectedMonth, selectedReportYear]);

  //fetching data from db
  useEffect(() => {
    const initializeData = async () => {
      if (activeTab === "overview") {
        await fetchOverviewData();
      } else if (activeTab === "performance") {
        await fetchPerformanceData();
      } else if (activeTab === "analytics") {
        await fetchAnalyticsData();
      } else if (activeTab === "reports") {
        await fetchReportData();
      }
      setIsLoading(false);
    };
    initializeData();
  }, [
    activeTab,
    fetchOverviewData,
    fetchAnalyticsData,
    fetchPerformanceData,
    fetchReportData,
    setIsLoading,
  ]);

  //Figure out why data is slow to display when YearPicker value changes
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
      case "performance":
        return (
          <YearPicker
            selectedYear={selectedYear}
            onYearChange={(newYear) => {
              setSelectedYear(newYear);
              fetchPerformanceData();
            }}
          />
        );
      case "analytics":
        return (
          <MonthYearPicker
            selectedMonth={selectedAnalyticsMonth}
            selectedYear={selectedAnalyticsYear}
            onMonthChange={(newMonth) => {
              setSelectedAnalyticsMonth(newMonth);
              fetchAnalyticsData();
            }}
            onYearChange={(newYear) => {
              setSelectedAnalyticsYear(newYear);
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

  const renderTabContent = () => {
    if (isFetchingData) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Revenue"
                value={`$${
                  adminDashboardOverviewData.totalRevenue.toLocaleString(
                    "en-US",
                    { maximumFractionDigits: 2 }
                  ) ?? "0.00"
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
                value={
                  adminDashboardOverviewData.pendingOrders.toString() ?? "0"
                }
                icon={ClockArrowUp}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total Invoices"
                value={
                  adminDashboardOverviewData.totalInvoices.toString() ?? "0"
                }
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
                    <Button className="w-full sm:w-auto bg-[#fd9e1d]">
                      View All Orders
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </>
        );

      case "performance":
        return (
          <div className="grid gap-4">
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] sm:h-[450px] md:h-[500px]">
                <RevenueGrowth
                  data={adminDashboardPerformanceData.revenueGrowthData}
                />
              </CardContent>
            </Card>
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] sm:h-[450px] md:h-[500px]">
                <ProductPerformance
                  data={adminDashboardPerformanceData.productPerformanceData}
                />
              </CardContent>
            </Card>
          </div>
        );

      case "analytics":
        return (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Year Revenue Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <SettingsProgress
                  value={
                    (adminDashboardAnalyticsData.yearlyRevenueData.actual /
                      adminDashboardAnalyticsData.yearlyRevenueData.projected) *
                    100
                  }
                />
                <p className="text-sm text-gray-500">
                  {adminDashboardAnalyticsData.yearlyRevenueData.actual &&
                  adminDashboardAnalyticsData.yearlyRevenueData.projected ? (
                    <>
                      {(
                        (adminDashboardAnalyticsData.yearlyRevenueData.actual /
                          adminDashboardAnalyticsData.yearlyRevenueData
                            .projected) *
                        100
                      ).toFixed(2)}
                      % of yearly target ($
                      {adminDashboardAnalyticsData.yearlyRevenueData.actual.toLocaleString()}{" "}
                      / $
                      {adminDashboardAnalyticsData.yearlyRevenueData.projected.toLocaleString()}
                      )
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
                <AnalyticsPieChart
                  variant="Revenue"
                  data={adminDashboardAnalyticsData.monthlyRevenueData}
                />
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-1">
              <CardHeader>
                <CardTitle>Expense Chart</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] sm:h-[350px] lg:h-[400px]">
                <AnalyticsPieChart
                  variant="Expense"
                  data={adminDashboardAnalyticsData.expenseData}
                />
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-1">
              <CardHeader>
                <CardTitle>Income Chart</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] sm:h-[350px] lg:h-[400px]">
                <AnalyticsPieChart
                  variant="Income"
                  data={adminDashboardAnalyticsData.incomeData}
                />
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-1">
              <CardHeader>
                <CardTitle>Profit Chart</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] sm:h-[350px] lg:h-[400px]">
                <AnalyticsPieChart
                  variant="Profit"
                  data={adminDashboardAnalyticsData.profitData}
                />
              </CardContent>
            </Card>
          </div>
        );

      case "reports":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View and download your reports</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsSection data={adminDashboardReportData} />
            </CardContent>
          </Card>
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
        defaultValue="overview"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="space-y-4">
          {renderTabContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
