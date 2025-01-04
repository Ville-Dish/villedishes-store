// api/dashboard/orders/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

type OrderDashboardData = {
  customer: string;
  order: string;
  orderDate: string;
  total: number;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 5;

    // Calculate default start and end dates
    const today = new Date();
    const defaultStartDate = new Date(today);
    defaultStartDate.setDate(today.getDate() - 30);

    const startDate =
      searchParams.get("startDate") ||
      defaultStartDate.toISOString().split("T")[0];
    const endDate =
      searchParams.get("endDate") || today.toISOString().split("T")[0];

    // console.log("Start date: ", startDate);
    // console.log("End date: ", endDate);

    // Construct the where clause
    const whereClause = {
      orderDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    // console.log("Where clause: ", JSON.stringify(whereClause, null, 2));

    const orders = await prisma.order.findMany({
      where: whereClause,
      take: limit,
      orderBy: { orderDate: "desc" },
      include: {
        shippingInfo: true,
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    // console.log(`Orders found: ${orders.length}`);

    const totalOrderAmount = await prisma.order.aggregate({
      where: whereClause,
      _sum: {
        total: true,
      },
    });

    // console.log("Total Amount:", totalOrderAmount);

    const totalOrderRevenue = await prisma.order.aggregate({
      where: {
        ...whereClause,
        status: {
          not: "UNVERIFIED",
        },
      },
      _sum: {
        total: true,
      },
    });
    // console.log("Total Revenue:", totalOrderRevenue);

    const totalOrders = await prisma.order.count({
      where: whereClause,
    });
    // console.log("Total Orders:", totalOrders);

    const recentOrders: OrderDashboardData[] = orders.map((order) => ({
      customer: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
      order: order.orderNumber || "",
      orderDate: order.orderDate || "",
      total: order.total,
    }));
    // console.log("Total Orders:", totalOrders);

    const unverifiedOrders = await prisma.order.count({
      where: {
        ...whereClause,
        status: "UNVERIFIED",
      },
    });
    // console.log("Total Unverified orders:", unverifiedOrders);

    const pendingOrders = await prisma.order.count({
      where: {
        ...whereClause,
        status: "PENDING",
      },
    });
    // console.log("Total Pending orders:", pendingOrders);

    const shippedOrders = await prisma.order.count({
      where: {
        ...whereClause,
        status: "FULFILLED",
      },
    });
    // console.log("Total Shipped orders:", shippedOrders);

    const cancelledOrders = await prisma.order.count({
      where: {
        ...whereClause,
        status: "CANCELLED",
      },
    });
    // console.log("Total Cancelled orders:", cancelledOrders);

    const response = {
      totalOrders,
      unverifiedOrders,
      pendingOrders,
      shippedOrders,
      cancelledOrders,
      totalOrderAmount: totalOrderAmount._sum?.total ?? 0,
      totalOrderRevenue: totalOrderRevenue._sum?.total ?? 0,
      recentOrders: recentOrders,
    };

    // console.log("Response:", JSON.stringify(response, null, 2));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        message: "Error fetching orders",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
