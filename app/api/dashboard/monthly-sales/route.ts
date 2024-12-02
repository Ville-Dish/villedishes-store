// app/api/dashboard/monthly-sales/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString()
    );
    const month = parseInt(
      searchParams.get("month") || (new Date().getMonth() + 1).toString()
    );

    // Fetch weekly sales data
    const weeklySales = await prisma.$queryRaw`
      SELECT 
        EXTRACT(WEEK FROM "orderDate") as week,
        SUM(total) as sales,
        COUNT(*) as orders,
        AVG(total) as averageOrderValue
      FROM "Order"
      WHERE EXTRACT(YEAR FROM "orderDate") = ${year}
        AND EXTRACT(MONTH FROM "orderDate") = ${month}
      GROUP BY EXTRACT(WEEK FROM "orderDate")
      ORDER BY week
    `;

    // Fetch top products
    const topProducts = await prisma.orderProduct.groupBy({
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

    const topProductDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, price: true },
        });
        return {
          name: product?.name,
          sales: item._sum.quantity || 0,
          revenue: (item._sum.quantity || 0) * (product?.price || 0),
          unitsSold: item._sum.quantity || 0,
        };
      })
    );

    return NextResponse.json({
      monthlySales: weeklySales,
      topProducts: topProductDetails,
    });
  } catch (error) {
    console.error("Error fetching monthly sales report:", error);
    return NextResponse.json(
      { message: "Error fetching monthly sales report", error },
      { status: 500 }
    );
  }
}
