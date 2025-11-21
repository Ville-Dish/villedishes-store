// api/dashboard/orders/route.ts

import prisma from "@/lib/prisma/client";
import { NextResponse } from "next/server";

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

    // Construct the where clause
    const whereClause = {
      orderDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Single query with proper aggregations
    const [orders, aggregations] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        take: limit,
        orderBy: { orderDate: "desc" },
        select: {
          id: true,
          orderNumber: true,
          orderDate: true,
          total: true,
          status: true,
          shippingInfo: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.$transaction([
        prisma.order.aggregate({
          where: whereClause,
          _sum: { total: true },
          _count: true,
        }),
        prisma.order.aggregate({
          where: { ...whereClause, status: { not: "UNVERIFIED" } },
          _sum: { total: true },
        }),
        prisma.order.count({
          where: { ...whereClause, status: "UNVERIFIED" },
        }),
        prisma.order.count({
          where: { ...whereClause, status: "PENDING" },
        }),
        prisma.order.count({
          where: { ...whereClause, status: "FULFILLED" },
        }),
        prisma.order.count({
          where: { ...whereClause, status: "CANCELLED" },
        }),
      ]),
    ]);

    const recentOrders: OrderDashboardData[] = orders.map((order) => ({
      customer: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
      order: order.orderNumber || "",
      orderDate: order.orderDate || "",
      total: order.total,
    }));

    const [
      totalOrderStats,
      revenueStats,
      unverified,
      pending,
      fulfilled,
      cancelled,
    ] = aggregations;

    const response = {
      totalOrders: totalOrderStats._count,
      unverifiedOrders: unverified,
      pendingOrders: pending,
      shippedOrders: fulfilled,
      cancelledOrders: cancelled,
      totalOrderAmount: totalOrderStats._sum?.total ?? 0,
      totalOrderRevenue: revenueStats._sum?.total ?? 0,
      recentOrders: recentOrders,
    };

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
