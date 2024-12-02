// app/api/dashboard/annual-performance/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

interface QuarterlyPerformance {
  quarter: number;
  sales: number;
  orders: number;
  customerSatisfaction: number;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString()
    );

    // Fetch quarterly performance data
    const quarterlyPerformance = await prisma.$queryRaw<QuarterlyPerformance[]>`
      SELECT 
        CAST(CEIL(CAST(SUBSTR("orderDate", 6, 2) AS INTEGER) / 3.0) AS INTEGER) as quarter,
        SUM(total) as sales,
        COUNT(*) as orders,
        AVG(COALESCE((SELECT AVG(CAST(rating AS FLOAT)) FROM "Review" WHERE "Review"."productId" = "OrderProduct"."productId"), 0)) as customerSatisfaction
      FROM "Order"
      JOIN "OrderProduct" ON "Order"."id" = "OrderProduct"."orderId"
      WHERE SUBSTR("orderDate", 1, 4) = ${year.toString()}
      GROUP BY CAST(CEIL(CAST(SUBSTR("orderDate", 6, 2) AS INTEGER) / 3.0) AS INTEGER)
      ORDER BY quarter
    `;

    // Calculate key metrics
    const totalAnnualSales = quarterlyPerformance.reduce(
      (sum, quarter) => sum + Number(quarter.sales),
      0
    );
    const totalOrders = quarterlyPerformance.reduce(
      (sum, quarter) => sum + Number(quarter.orders),
      0
    );
    const avgCustomerSatisfaction =
      quarterlyPerformance.reduce(
        (sum, quarter) => sum + Number(quarter.customerSatisfaction),
        0
      ) / 4;

    // Fetch previous year's total sales for year-over-year growth
    const previousYearSales = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        orderDate: {
          gte: `${year - 1}-01-01`,
          lt: `${year}-01-01`,
        },
      },
    });

    const yearOverYearGrowth = previousYearSales._sum.total
      ? ((totalAnnualSales - previousYearSales._sum.total) /
          previousYearSales._sum.total) *
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
      // Add more metrics as needed
    ];

    return NextResponse.json({
      quarterlyPerformance,
      keyMetrics,
    });
  } catch (error) {
    console.error("Error fetching annual performance review:", error);
    return NextResponse.json(
      { message: "Error fetching annual performance review", error },
      { status: 500 }
    );
  }
}
