// api/invoices/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
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
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    const totalIncomeAmount = await prisma.income.aggregate({
      where: whereClause,
      _sum: {
        amount: true,
      },
    });

    const response = {
      totalIncomeAmount: totalIncomeAmount._sum.amount || 0,
    };

    // console.log("Response:", JSON.stringify(response, null, 2));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching invoice data:", error);
    return NextResponse.json(
      { message: "Error fetching invoice data", error },
      { status: 500 }
    );
  }
}
