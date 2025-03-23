import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");

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

    const products = await prisma.product.findMany({
      include: {
        OrderProduct: true, // Assuming you want to include related order products
      },
      ...(limit ? { take: limit } : {}),
    });

    return NextResponse.json({
      data: products,
      message: "Products retrieved successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error retrieving products:", error);
    return NextResponse.json(
      { message: "Error retrieving products", error },
      { status: 500 }
    );
  }
}
