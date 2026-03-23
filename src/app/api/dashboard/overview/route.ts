import prisma from "@/lib/prisma/client";
import { NextResponse } from "next/server";

// Define a type for the data structure
type DataStructure = { [key: string]: unknown };

// Define types for our data structures
type RevenueGrowthData = {
  month: string;
  revenue: number;
};

type ProductPerformanceData = {
  name: string;
  value: number;
};

type ResponseData = {
  revenueGrowthData: RevenueGrowthData[];
  productPerformanceData: ProductPerformanceData[];
};

// Helper function to serialize BigInt
const serializeBigInt = (data: DataStructure): DataStructure => {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
  );
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const currentYear = new Date().getFullYear();
    const year = parseInt(searchParams.get("year") || currentYear.toString());

    if (isNaN(year)) {
      throw new Error("Invalid year parameter");
    }

    const startDate = new Date(year, 0, 1).toISOString();
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999).toISOString();

    // Fetch monthly revenue projections for the specified year
    const [monthlyRevenue, orderProducts, invoiceProducts] =
      await prisma.$transaction([
        prisma.monthlyProjection.findMany({
          where: {
            revenue: {
              year,
            },
          },
          select: {
            month: true,
            actual: true,
          },
          orderBy: {
            month: "asc",
          },
        }),

        prisma.orderProduct.groupBy({
          by: ["productId"],
          orderBy: {
            productId: "asc",
          },
          where: {
            order: {
              orderDate: { gte: startDate, lte: endDate },
              status: { in: ["PENDING", "FULFILLED"] },
            },
          },
          _sum: { quantity: true },
        }),

        // Fetch invoice products
        prisma.invoiceProducts.findMany({
          where: {
            invoice: {
              dateCreated: {
                gte: startDate,
                lte: endDate,
              },
              status: "PAID",
            },
          },
          include: {
            Product: true,
          },
        }),
      ]);

    // Aggregate product quantities from both sources
    const productQuantities = new Map<string, number>();
    const productNames = new Map<string, string>();

    for (const op of orderProducts) {
      productQuantities.set(op.productId, op._sum?.quantity ?? 0);
    }

    for (const ip of invoiceProducts) {
      for (const product of ip.Product) {
        productNames.set(product.id, product.name);
        productQuantities.set(
          product.id,
          (productQuantities.get(product.id) ?? 0) + ip.quantity,
        );
      }
    }

    // Fetch names only for orderProducts that weren't covered by invoiceProducts
    const missingIds = [...productQuantities.keys()].filter(
      (id) => !productNames.has(id),
    );
    if (missingIds.length > 0) {
      const missingProducts = await prisma.product.findMany({
        where: { id: { in: missingIds } },
        select: { id: true, name: true },
      });
      for (const p of missingProducts) {
        productNames.set(p.id, p.name);
      }
    }

    const productPerformanceData: ProductPerformanceData[] = [
      ...productQuantities.entries(),
    ]
      .map(([id, value]) => ({ name: productNames.get(id) ?? id, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const revenueGrowthData: RevenueGrowthData[] = monthlyRevenue.map(
      ({ month, actual }) => ({
        month,
        revenue: parseFloat(actual.toFixed(1)),
      }),
    );

    const response: ResponseData = {
      revenueGrowthData,
      productPerformanceData,
    };

    return NextResponse.json(serializeBigInt(response));
  } catch (error) {
    console.error("Error fetching dashboard overview data:", error);
    return NextResponse.json(
      {
        message: "Error fetching dashboard overview data",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
