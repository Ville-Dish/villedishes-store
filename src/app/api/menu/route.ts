import prisma from "@/lib/prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const limitParam = searchParams.get("limit");
    const category = searchParams.get("category");

    // Get all unique categories (always needed for the filter tabs)
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
      where: {
        category: { not: null },
      },
    });

    const uniqueCategories = categories
      .map((c) => c.category as string)
      .filter(Boolean);

    let limit: number | undefined;
    if (limitParam) {
      limit = Number.parseInt(limitParam, 10);

      if (isNaN(limit) || limit <= 0) {
        return NextResponse.json(
          { message: "Invalid limit parameter" },
          { status: 400 }
        );
      }
    }

    const whereClause = category ? { category } : {};

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        OrderProduct: true, // Assuming you want to include related order products
      },
      ...(limit ? { take: limit } : {}),
    });

    return NextResponse.json(
      {
        data: products,
        categories: uniqueCategories,
        message: "Products data retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving products:", error);
    return NextResponse.json(
      { message: "Error retrieving products", error },
      { status: 500 }
    );
  }
}
