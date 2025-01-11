// app/api/dashboard/annual-performance/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

interface QuarterlyPerformance {
  quarter: number;
  sales: number;
  target: number;
  customerSatisfaction: number;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString()
    );

    if (isNaN(year)) {
      throw new Error("Invalid year parameter");
    }

    const startDate = new Date(year, 0, 1).toISOString();
    const endDate = new Date(year, 11, 31, 23, 59, 59).toISOString();

    // Fetch revenue and monthly projections for the year
    const revenueData = await prisma.revenue.findFirst({
      where: { year },
      include: { monthlyProjections: true },
    });

    if (!revenueData) {
      throw new Error("No revenue data found for the specified year");
    }

    // Fetch orders
    const orders = await prisma.order.groupBy({
      by: ["orderDate"],
      where: {
        orderDate: {
          gte: startDate,
          lt: endDate,
        },
        status: {
          in: ["PENDING", "FULFILLED"],
        },
      },

      _sum: {
        total: true,
      },

      _count: {
        id: true,
      },
    });

    const invoices = await prisma.invoice.groupBy({
      by: ["dateCreated"],
      where: {
        dateCreated: {
          gte: startDate,
          lt: endDate,
        },
        status: "PAID",
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Fetch income
    const income = await prisma.income.groupBy({
      by: ["date"],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Fetch customer satisfaction (from Reviews)
    const customerSatisfaction = await prisma.review.groupBy({
      by: ["productId"],
      _avg: {
        rating: true,
      },
    });

    // Process data
    const quarterlyData: { [key: number]: QuarterlyPerformance } = {
      1: { quarter: 1, sales: 0, target: 0, customerSatisfaction: 0 },
      2: { quarter: 2, sales: 0, target: 0, customerSatisfaction: 0 },
      3: { quarter: 3, sales: 0, target: 0, customerSatisfaction: 0 },
      4: { quarter: 4, sales: 0, target: 0, customerSatisfaction: 0 },
    };

    let totalSatisfaction = 0;
    let satisfactionCount = 0;

    const monthNameToNumber: { [key: string]: number } = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    };

    // Initialize sales and target from monthly projections
    if (
      revenueData.monthlyProjections &&
      revenueData.monthlyProjections.length > 0
    ) {
      revenueData.monthlyProjections.forEach((projection) => {
        const month = monthNameToNumber[projection.month];
        const quarter = Math.floor(month / 3) + 1;
        if (quarterlyData[quarter]) {
          // quarterlyData[quarter].sales += projection.actual || 0;
          quarterlyData[quarter].target += projection.projection || 0;
        }
      });
    }

    orders.forEach((order) => {
      if (order.orderDate) {
        const quarter =
          Math.floor(new Date(order.orderDate).getMonth() / 3) + 1;
        quarterlyData[quarter].sales += order._sum?.total || 0;
      }
    });

    invoices.forEach((invoice) => {
      const quarter =
        Math.floor(new Date(invoice.dateCreated).getMonth() / 3) + 1;
      quarterlyData[quarter].sales += invoice._sum?.amount || 0;
    });

    income.forEach((inc) => {
      const quarter = Math.floor(new Date(inc.date).getMonth() / 3) + 1;
      quarterlyData[quarter].sales += inc._sum?.amount || 0;
    });

    customerSatisfaction.forEach((cs) => {
      if (cs._avg.rating) {
        totalSatisfaction += cs._avg.rating;
        satisfactionCount++;
      }
    });

    const avgSatisfaction =
      satisfactionCount > 0 ? totalSatisfaction / satisfactionCount : 0;
    Object.values(quarterlyData).forEach((quarter) => {
      quarter.customerSatisfaction = avgSatisfaction;
    });

    const quarterlyPerformance = Object.values(quarterlyData);

    // Calculate key metrics
    const totalAnnualSales = quarterlyPerformance.reduce(
      (sum, quarter) => sum + quarter.sales,
      0
    );
    const totalOrders = quarterlyPerformance.reduce(
      (sum, quarter) => sum + quarter.target,
      0
    );
    const avgCustomerSatisfaction = avgSatisfaction;

    // Fetch previous year's total sales from Revenue model
    const previousYear = year - 1;
    const previousYearRevenue = await prisma.revenue.findFirst({
      where: { year: previousYear },
      include: { monthlyProjections: true },
    });

    const previousYearTotalSales = previousYearRevenue
      ? previousYearRevenue.monthlyProjections.reduce(
          (sum, month) => sum + month.actual,
          0
        )
      : 0;

    const yearOverYearGrowth = previousYearTotalSales
      ? ((totalAnnualSales - previousYearTotalSales) / previousYearTotalSales) *
        100
      : 0;

    const keyMetrics = [
      {
        metric: "Total Annual Sales",
        value: `$${totalAnnualSales.toFixed(2)}`,
      },
      {
        metric: "Year-over-Year Growth",
        value: `${yearOverYearGrowth.toFixed(2)}%`,
      },
      {
        metric: "Average Customer Satisfaction",
        value: `${avgCustomerSatisfaction.toFixed(2)}/5`,
      },
      { metric: "Total Orders", value: totalOrders.toString() },
    ];

    const response = {
      quarterlyPerformance,
      keyMetrics,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching annual performance review:", error);
    return NextResponse.json(
      {
        message: "Error fetching annual performance review",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
