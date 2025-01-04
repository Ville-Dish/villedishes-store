// app/api/dashboard/monthly-sales/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

// Define the type for a single week's sales data
type WeeklySalesData = {
  week: number;
  sales: number;
  orders: number;
  averageOrderValue: number;
};

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
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const year = parseInt(searchParams.get("year") || currentYear.toString());
    const month = parseInt(
      searchParams.get("month") || currentMonth.toString()
    );

    // console.log("Year selected", year);
    // console.log("Month selected", month);

    if (isNaN(year) || isNaN(month)) {
      throw new Error("Invalid year or month parameter");
    }

    let weeklySales: WeeklySalesData[] = [];
    try {
      // Fetch weekly sales data
      const result = await prisma.$queryRaw`
        SELECT 
          CAST(strftime('%W', "orderDate") AS INTEGER) + 1 as week,
          COALESCE(CAST(SUM(total) AS FLOAT), 0) as sales,
          COUNT(*) as orders,
          COALESCE(CAST(AVG(total) AS FLOAT), 0) as averageOrderValue
        FROM "Order"
        WHERE strftime('%Y', "orderDate") = ${year.toString()}
          AND strftime('%m', "orderDate") = ${month.toString().padStart(2, "0")}
        GROUP BY strftime('%W', "orderDate")
        ORDER BY week
      `;

      if (!Array.isArray(result)) {
        throw new Error(`Expected an array, but got: ${typeof result}`);
      }

      weeklySales = result.map((item) => ({
        week: Number(item.week),
        sales: Number(item.sales),
        orders: Number(item.orders),
        averageOrderValue: Number(item.averageOrderValue),
      }));

      // console.log("Weekly sales data fetched successfully");
    } catch (error) {
      console.error(
        "Error fetching weekly sales data:",
        error instanceof Error ? error.message : "Unknown error"
      );
      return NextResponse.json(
        {
          message: "Failed to fetch weekly sales data",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    // console.log(
    //   "Weekly sales data:",
    //   JSON.stringify(weeklySales, bigIntSerializer, 2)
    // );

    let topProducts = [];
    try {
      // Fetch top products
      topProducts = await prisma.orderProduct.groupBy({
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
      // console.log("Top products data fetched successfully");
    } catch (error) {
      console.error("Error fetching top products:", error);
      throw new Error("Failed to fetch top products");
    }

    // console.log("Top products data:", JSON.stringify(topProducts, null, 2));

    let topProductDetails = [];
    try {
      topProductDetails = await Promise.all(
        topProducts.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { name: true, price: true },
          });
          return {
            name: product?.name ?? "Unknown Product",
            sales: Number(item._sum.quantity) || 0,
            revenue: Number((item._sum.quantity || 0) * (product?.price || 0)),
            unitsSold: Number(item._sum.quantity) || 0,
          };
        })
      );
      // console.log("Top product details processed successfully");
    } catch (error) {
      console.error("Error processing top product details:", error);
      throw new Error("Failed to process top product details");
    }

    // console.log(
    //   "Top product details:",
    //   JSON.stringify(topProductDetails, null, 2)
    // );

    const response = {
      monthlySales: weeklySales,
      topProducts: topProductDetails,
    };

    // console.log(
    //   "Final response:",
    //   JSON.stringify(response, bigIntSerializer, 2)
    // );

    if (weeklySales.length === 0 && topProductDetails.length === 0) {
      return NextResponse.json(
        { message: "No data found for the specified period" },
        { status: 404 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET function:", error);
    return NextResponse.json(
      {
        message: "Error fetching monthly sales report",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
