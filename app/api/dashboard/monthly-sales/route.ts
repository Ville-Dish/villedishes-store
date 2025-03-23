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

type TopProductsData = {
  name: string;
  sales: number;
  revenue: number;
  unitsSold: number;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const year = parseInt(searchParams.get("year") || currentYear.toString());
    const month = parseInt(
      searchParams.get("month") || currentMonth.toString()
    );

    if (isNaN(year) || isNaN(month)) {
      throw new Error("Invalid year or month parameter");
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    let weeklySales: WeeklySalesData[] = [];
    try {
      const [orders, invoices, incomes] = await Promise.all([
        prisma.order.groupBy({
          by: ["orderDate"],
          where: {
            orderDate: {
              gte: startDate.toISOString(),
              lte: endDate.toISOString(),
            },
            status: {
              in: ["PENDING", "FULFILLED"],
            },
          },
          _count: {
            id: true,
          },
          _sum: {
            total: true,
          },
        }),
        prisma.invoice.groupBy({
          by: ["dateCreated"],
          where: {
            dateCreated: {
              gte: startDate.toISOString(),
              lte: endDate.toISOString(),
            },
            status: "PAID",
          },
          _count: {
            id: true,
          },
          _sum: {
            amount: true,
          },
        }),
        prisma.income.groupBy({
          by: ["date"],
          where: {
            date: {
              gte: startDate.toISOString(),
              lte: endDate.toISOString(),
            },
          },
          _sum: {
            amount: true,
          },
        }),
      ]);

      const weeklyData = new Map<number, WeeklySalesData>();

      orders.forEach((item) => {
        const date = item.orderDate ? new Date(item.orderDate) : new Date();
        const week = Math.ceil((date.getDate() + 6 - date.getDay()) / 7);
        const existingData = weeklyData.get(week) || {
          week,
          sales: 0,
          orders: 0,
          averageOrderValue: 0,
        };
        existingData.sales += item._sum?.total || 0;
        existingData.orders += item._count?.id || 0;
        weeklyData.set(week, existingData);
      });

      invoices.forEach((item) => {
        const date = new Date(item.dateCreated);
        const week = Math.ceil((date.getDate() + 6 - date.getDay()) / 7);
        const existingData = weeklyData.get(week) || {
          week,
          sales: 0,
          orders: 0,
          averageOrderValue: 0,
        };
        existingData.sales += item._sum?.amount || 0;
        existingData.orders += item._count?.id || 0;
        weeklyData.set(week, existingData);
      });

      incomes.forEach((item) => {
        const date = new Date(item.date);
        const week = Math.ceil((date.getDate() + 6 - date.getDay()) / 7);
        const existingData = weeklyData.get(week) || {
          week,
          sales: 0,
          orders: 0,
          averageOrderValue: 0,
        };
        existingData.sales += item._sum?.amount || 0;
        weeklyData.set(week, existingData);
      });

      weeklySales = Array.from(weeklyData.values()).map((item) => ({
        ...item,
        averageOrderValue: item.orders > 0 ? item.sales / item.orders : 0,
      }));
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

    let topProducts: TopProductsData[] = [];
    try {
      const orderProducts = await prisma.orderProduct.groupBy({
        by: ["productId"],
        where: {
          order: {
            orderDate: {
              gte: startDate.toISOString(),
              lte: endDate.toISOString(),
            },
            status: {
              in: ["PENDING", "FULFILLED"],
            },
          },
        },
        _sum: {
          quantity: true,
        },
        _count: {
          orderId: true,
        },
      });

      const invoiceProducts = await prisma.invoiceProducts.findMany({
        where: {
          invoice: {
            dateCreated: {
              gte: startDate.toISOString(),
              lte: endDate.toISOString(),
            },
            status: "PAID",
          },
        },
        include: {
          Product: true,
        },
      });

      const productMap = new Map<
        string,
        { unitsSold: number; sales: number }
      >();

      orderProducts.forEach((item) => {
        productMap.set(item.productId, {
          unitsSold: (item._sum?.quantity || 0) as number,
          sales: (item._count?.orderId || 0) as number,
        });
      });

      invoiceProducts.forEach((item) => {
        item.Product.forEach((product) => {
          const productId = product.id;
          const existing = productMap.get(productId) || {
            unitsSold: 0,
            sales: 0,
          };
          existing.unitsSold += item.quantity;
          existing.sales += 1; //Count each invoice as one sale
          productMap.set(productId, existing);
        });
      });

      const productDetails = await prisma.product.findMany({
        where: {
          id: {
            in: Array.from(productMap.keys()),
          },
        },
        select: {
          id: true,
          name: true,
          price: true,
        },
      });

      topProducts = productDetails
        .map((product) => {
          const data = productMap.get(product.id) || { unitsSold: 0, sales: 0 };
          return {
            name: product.name,
            sales: data.sales,
            revenue: Number((data.unitsSold * product.price).toFixed(2)),
            unitsSold: data.unitsSold,
          };
        })
        .sort((a, b) => b.unitsSold - a.unitsSold)
        .slice(0, 5);
    } catch (error) {
      console.error("Error fetching top products:", error);
      throw new Error("Failed to fetch top products");
    }

    const response = {
      monthlySales: weeklySales,
      topProducts: topProducts,
    };

    if (weeklySales.length === 0 && topProducts.length === 0) {
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
