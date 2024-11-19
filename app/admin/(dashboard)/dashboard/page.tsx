import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/custom/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  CreditCard,
  FileText,
  ClockArrowUp,
  TriangleAlert,
  ClockAlert,
  CircleX,
} from "lucide-react";
import { ReportsTable } from "@/components/custom/dashboard/report-table";
import {
  adminOverViewData,
  adminProductPerformanceData,
  adminRevenueGrowthData,
  adminRecentOrders,
} from "@/lib/constantData";
import { RevenueGrowth } from "@/components/custom/dashboard/revenue-growth";
import { ProductPerformance } from "@/components/custom/dashboard/product-performance";
import { RecentOrders } from "@/components/custom/dashboard/recent-orders";
import { Overview } from "@/components/custom/dashboard/overview";
import Link from "next/link";

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
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <DatePickerWithRange />
          <Button>Filter</Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab View */}
        <TabsContent value="overview" className="space-y-4">
          <StatCard
            title="Total Revenue"
            value="$45,231.89"
            icon={DollarSign}
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Total Orders" value="12,234" icon={CreditCard} />
            <StatCard
              title="Unverified Orders"
              value="543"
              icon={TriangleAlert}
            />
            <StatCard title="Pending Orders" value="543" icon={ClockArrowUp} />
            <StatCard title="Total Invoices" value="1,234" icon={FileText} />
            <StatCard title="Unpaid Invoices" value="1,234" icon={CircleX} />
            <StatCard title="Due Invoices" value="1,234" icon={ClockAlert} />
          </div>
          {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"> */}
          <div className="w-3/4 items-center justify-center">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  {/* You made 265 sales this month. */}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentOrders data={adminRecentOrders} />
              </CardContent>
              <CardFooter className="items-center justify-center">
                <Link href="/admin/orders" className="mb-3" passHref>
                  <Button className="w-full">View All Orders</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab View */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview data={adminOverViewData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueGrowth data={adminRevenueGrowthData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductPerformance data={adminProductPerformanceData} />
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
              <ReportsTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
