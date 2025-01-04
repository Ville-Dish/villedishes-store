// app/api/dashboard/annual-performance/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

interface QuarterlyPerformance {
  quarter: number;
  sales: number;
  orders: number;
  customerSatisfaction: number;
}

// Custom serializer function to handle BigInt
// const bigIntSerializer = (key: string, value: unknown) => {
//   if (typeof value === "bigint") {
//     return value.toString();
//   }
//   return value;
// };

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString()
    );

    console.log("Fetching data for year:", year);

    if (isNaN(year)) {
      throw new Error("Invalid year parameter");
    }

    // Fetch quarterly performance data
    const rawQuarterlyPerformance = await prisma.$queryRaw`
      SELECT 
        CASE
          WHEN CAST(SUBSTR("orderDate", 6, 2) AS INTEGER) BETWEEN 1 AND 3 THEN 1
          WHEN CAST(SUBSTR("orderDate", 6, 2) AS INTEGER) BETWEEN 4 AND 6 THEN 2
          WHEN CAST(SUBSTR("orderDate", 6, 2) AS INTEGER) BETWEEN 7 AND 9 THEN 3
          ELSE 4
        END as quarter,
        COALESCE(SUM(CAST(total AS DECIMAL(10,2))), 0) as sales,
        COUNT(*) as orders,
        COALESCE(AVG(COALESCE((SELECT AVG(CAST(rating AS FLOAT)) FROM "Review" WHERE "Review"."productId" = "OrderProduct"."productId"), 0)), 0) as customerSatisfaction
      FROM "Order"
      LEFT JOIN "OrderProduct" ON "Order"."id" = "OrderProduct"."orderId"
      WHERE SUBSTR("orderDate", 1, 4) = ${year.toString()}
      GROUP BY 
        CASE
          WHEN CAST(SUBSTR("orderDate", 6, 2) AS INTEGER) BETWEEN 1 AND 3 THEN 1
          WHEN CAST(SUBSTR("orderDate", 6, 2) AS INTEGER) BETWEEN 4 AND 6 THEN 2
          WHEN CAST(SUBSTR("orderDate", 6, 2) AS INTEGER) BETWEEN 7 AND 9 THEN 3
          ELSE 4
        END
      ORDER BY quarter
    `;

    // console.log(
    //   "Raw quarterly performance data:",
    //   JSON.stringify(rawQuarterlyPerformance, bigIntSerializer, 2)
    // );

    if (
      !Array.isArray(rawQuarterlyPerformance) ||
      rawQuarterlyPerformance.length === 0
    ) {
      return NextResponse.json(
        { message: "No data found for the specified year" },
        { status: 404 }
      );
    }

    const quarterlyPerformance: QuarterlyPerformance[] =
      rawQuarterlyPerformance.map((quarter) => ({
        quarter: Number(quarter.quarter),
        sales: Number(quarter.sales) || 0,
        orders: Number(quarter.orders) || 0,
        customerSatisfaction: Number(quarter.customerSatisfaction) || 0,
      }));

    // console.log(
    //   "Processed quarterly performance data:",
    //   JSON.stringify(quarterlyPerformance, null, 2)
    // );

    // Calculate key metrics
    const totalAnnualSales = quarterlyPerformance.reduce(
      (sum, quarter) => sum + quarter.sales,
      0
    );
    const totalOrders = quarterlyPerformance.reduce(
      (sum, quarter) => sum + quarter.orders,
      0
    );
    const avgCustomerSatisfaction =
      quarterlyPerformance.reduce(
        (sum, quarter) => sum + quarter.customerSatisfaction,
        0
      ) / quarterlyPerformance.length || 0;

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

    // console.log(
    //   "Previous year sales:",
    //   JSON.stringify(previousYearSales, bigIntSerializer, 2)
    // );

    const yearOverYearGrowth = previousYearSales._sum?.total
      ? ((totalAnnualSales - Number(previousYearSales._sum.total)) /
          Number(previousYearSales._sum.total)) *
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

    // console.log("Final response:", JSON.stringify(response, null, 2));

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
