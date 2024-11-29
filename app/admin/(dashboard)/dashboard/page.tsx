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
import {
  adminOverViewData,
  adminProductPerformanceData,
  adminRevenueGrowthData,
  adminRecentOrders,
  adminReportData,
} from "@/lib/constantData";
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
import { subDays } from "date-fns";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

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

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [filteredOverviewData, setFiltereredOverviewData] =
    useState(adminOverViewData);
  const [filteredRevenueData, setFilteredRevenueData] = useState(
    adminRevenueGrowthData
  );
  const [filteredProductData, setFilteredProductData] = useState(
    adminProductPerformanceData
  );

  const filterData = useCallback(() => {
    let fromDate: Date, toDate: Date;

    if (activeTab === "overview" && dateRange?.from && dateRange?.to) {
      fromDate = dateRange.from;
      toDate = dateRange.to;
    } else if (activeTab === "analytics") {
      fromDate = new Date(selectedYear, 0, 1);
      toDate = new Date(selectedYear, 11, 31);
    } else if (activeTab === "reports") {
      fromDate = new Date(selectedYear, selectedMonth - 1, 1);
      toDate = new Date(selectedYear, selectedMonth, 0);
    } else {
      return; // If no valid date range, exit the function
    }

    // Filter Overview Data
    const filteredOverview = adminOverViewData.filter((item) => {
      const itemDate = new Date(`${item.name}-01`);
      return itemDate >= fromDate && itemDate <= toDate;
    });
    setFiltereredOverviewData(filteredOverview);

    // Filter Revenue Growth Data
    const filteredRevenue = adminRevenueGrowthData.filter((item) => {
      const itemDate = new Date(item.name);
      return itemDate >= fromDate && itemDate <= toDate;
    });
    setFilteredRevenueData(filteredRevenue);

    // Filter Product Performance Data
    const filteredProduct = adminProductPerformanceData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= fromDate && itemDate <= toDate;
    });
    setFilteredProductData(filteredProduct);
  }, [activeTab, dateRange?.from, dateRange?.to, selectedMonth, selectedYear]);

  useEffect(() => {
    filterData();
  }, [activeTab, dateRange, selectedYear, selectedMonth, filterData]);

  const renderDatePicker = () => {
    switch (activeTab) {
      case "overview":
        return <DatePickerWithRange date={dateRange} setDate={setDateRange} />;
      case "analytics":
        return (
          <YearPicker
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        );
      case "reports":
        return (
          <MonthYearPicker
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        );
      default:
        return null;
    }
  };

  if (!user) {
    router.push("/login");
    return <p>Redirecting to login...</p>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          {renderDatePicker()}
          <Button onClick={filterData}>Filter</Button>
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
              value="$45,231.89"
              icon={DollarSign}
            />
            <StatCard title="Total Orders" value="12,234" icon={CreditCard} />
            <StatCard
              title="Unverified Orders"
              value="543"
              icon={TriangleAlert}
            />
            <StatCard title="Pending Orders" value="543" icon={ClockArrowUp} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Total Invoices" value="1,234" icon={FileText} />
            <StatCard title="Unpaid Invoices" value="1,234" icon={CircleX} />
            <StatCard title="Due Invoices" value="1,234" icon={ClockAlert} />
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
                <RecentOrders data={adminRecentOrders} />
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
                <Overview data={filteredOverviewData} />
              </CardContent>
            </Card>
            <Card className="col-span-3 md:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueGrowth data={filteredRevenueData} />
              </CardContent>
            </Card>
            <Card className="col-span-3 md:col-span-1">
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductPerformance data={filteredProductData} />
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
              <ReportsSection data={adminReportData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
