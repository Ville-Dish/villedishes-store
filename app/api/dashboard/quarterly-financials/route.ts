// app/api/dashboard/quarterly-financials/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

interface RawMonthlyData {
  month: bigint;
  revenue: bigint;
  expenses: bigint;
  profit: bigint;
}

interface MonthlyData {
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
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
    const quarter = parseInt(
      searchParams.get("quarter") ||
        Math.floor(new Date().getMonth() / 3 + 1).toString()
    );

    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;

    // Fetch monthly financial data
    const rawMonthlyData = await prisma.$queryRaw<RawMonthlyData[]>`
      SELECT 
        CAST(SUBSTR("orderDate", 6, 2) AS INTEGER) as month,
        SUM(total) as revenue,
        SUM(tax) as expenses,
        SUM(total - tax) as profit
      FROM "Order"
      WHERE SUBSTR("orderDate", 1, 4) = ${year.toString()}
        AND CAST(SUBSTR("orderDate", 6, 2) AS INTEGER) BETWEEN ${startMonth} AND ${endMonth}
      GROUP BY SUBSTR("orderDate", 6, 2)
      ORDER BY month
    `;

    // Convert BigInt values to numbers
    const monthlyData: MonthlyData[] = rawMonthlyData.map(
      (item: RawMonthlyData) => ({
        month: Number(item.month),
        revenue: Number(item.revenue),
        expenses: Number(item.expenses),
        profit: Number(item.profit),
      })
    );

    // Fetch expense breakdown (simplified, as we don't have detailed expense categories)
    const expenseBreakdown = [
      {
        category: "Tax",
        amount: monthlyData.reduce(
          (sum, month) => sum + Number(month.expenses),
          0
        ),
      },
      // Add more categories if you have them in your database
    ];

    return NextResponse.json({
      quarterlyData: monthlyData,
      expenseBreakdown: expenseBreakdown,
    });
  } catch (error) {
    console.error("Error fetching quarterly financial statement:", error);
    return NextResponse.json(
      { message: "Error fetching quarterly financial statement", error },
      { status: 500 }
    );
  }
}
