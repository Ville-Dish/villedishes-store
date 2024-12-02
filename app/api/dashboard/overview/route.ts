// app/api/dashboard/overview/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

// Define a type for the data structure
type DataStructure = {
  [key: string]: unknown;
};

// Helper function to serialize BigInt
const serializeBigInt = (data: DataStructure): DataStructure => {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v))
  );
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const currentYear = new Date().getFullYear();
    const year = parseInt(searchParams.get("year") || currentYear.toString());

    // console.log("YEAR", year);

    if (isNaN(year)) {
      throw new Error("Invalid year parameter");
    }

    // Fetch monthly order totals for the Overview
    const monthlyTotals = await prisma.$queryRaw`
      SELECT 
        CAST(SUBSTR("orderDate", 6, 2) AS INTEGER) as month,
        COUNT(*) as total
      FROM "Order"
      WHERE SUBSTR("orderDate", 1, 4) = ${year.toString()}
      GROUP BY SUBSTR("orderDate", 6, 2)
      ORDER BY month
    `;

    // Fetch monthly revenue for RevenueGrowth
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        CAST(SUBSTR("orderDate", 6, 2) AS INTEGER) as month,
        SUM(CAST(total AS DECIMAL(10,2))) as revenue
      FROM "Order"
      WHERE SUBSTR("orderDate", 1, 4) = ${year.toString()}
        AND status != 'UNVERIFIED'
      GROUP BY SUBSTR("orderDate", 6, 2)
      ORDER BY month
    `;

    // Fetch product performance data
    const productPerformance = await prisma.orderProduct.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const productDetails = await Promise.all(
      productPerformance.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });
        return {
          name: product?.name ?? "Unknown Product",
          value: item._sum.quantity ?? 0,
        };
      })
    );

    const response = serializeBigInt({
      overviewData: monthlyTotals,
      revenueGrowthData: monthlyRevenue,
      productPerformanceData: productDetails,
    });

    // console.log("Response:", JSON.stringify(response, null, 2));

    if (
      !Array.isArray(response.overviewData) ||
      !Array.isArray(response.revenueGrowthData) ||
      !Array.isArray(response.productPerformanceData)
    ) {
      throw new Error("Invalid data structure in query results");
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching dashboard overview data:", error);
    return NextResponse.json(
      {
        message: "Error fetching dashboard overview data",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
