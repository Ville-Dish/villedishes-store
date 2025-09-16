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
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v))
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

    // Fetch monthly revenue projections for the specified year
    const monthlyRevenue = await prisma.monthlyProjection.findMany({
      where: {
        revenue: {
          year: year,
        },
      },
      select: {
        month: true,
        actual: true,
      },
      orderBy: {
        month: "asc",
      },
    });

    // Transform the monthly revenue data to match the desired format
    const revenueGrowthData: RevenueGrowthData[] = monthlyRevenue.map(
      (item) => ({
        month: item.month,
        revenue: parseFloat(item.actual.toFixed(1)),
      })
    );

    // Fetch product performance data for specified year
    let productPerformance: ProductPerformanceData[] = [];
    try {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const [orderProducts, invoiceProducts] = await Promise.all([
        prisma.orderProduct.groupBy({
          by: ["productId"],
          where: {
            order: {
              orderDate: {
                gte: startDate,
                lte: endDate,
              },
              status: {
                in: ["PENDING", "FULFILLED"],
              },
            },
          },
          _sum: {
            quantity: true,
          },
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

      const productQuantities = new Map<string, number>();

      orderProducts.forEach((op) => {
        productQuantities.set(op.productId, op._sum.quantity || 0);
      });

      // Aggregate quantities from invoice products
      invoiceProducts.forEach((ip) => {
        ip.Product.forEach((product) => {
          const currentQuantity = productQuantities.get(product.id) || 0;
          productQuantities.set(product.id, currentQuantity + ip.quantity);
        });
      });

      const productsWithNames = await prisma.product.findMany({
        where: {
          id: { in: Array.from(productQuantities.keys()) },
        },
        select: { id: true, name: true },
      });

      productPerformance = productsWithNames
        .map((product) => ({
          name: product.name,
          value: productQuantities.get(product.id) || 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    } catch (queryError) {
      console.error("Error in product performance query:", queryError);
    }

    const response: ResponseData = {
      revenueGrowthData: revenueGrowthData,
      productPerformanceData: productPerformance,
    };

    const serializedResponse = serializeBigInt(response);

    return NextResponse.json(serializedResponse);
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
