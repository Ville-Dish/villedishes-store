// api/invoices/route.ts

import prisma from "@/lib/prisma/client";
import { NextResponse } from "next/server";

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
      dateCreated: {
        gte: startDate,
        lte: endDate,
      },
    };

    const [
      totalInvoices,
      unpaidInvoices,
      dueInvoices,
      paidInvoices,
      pendingInvoices,
      totalInvoiceAmount,
      totalInvoiceRevenue,
    ] = await prisma.$transaction([
      prisma.invoice.count({
        where: whereClause,
      }),
      prisma.invoice.count({
        where: {
          ...whereClause,
          status: "UNPAID",
        },
      }),
      prisma.invoice.count({
        where: {
          ...whereClause,
          status: "DUE",
        },
      }),
      prisma.invoice.count({
        where: {
          ...whereClause,
          status: "PAID",
        },
      }),
      prisma.invoice.count({
        where: {
          ...whereClause,
          status: "PENDING",
        },
      }),
      prisma.invoice.aggregate({
        where: whereClause,
        _sum: {
          amount: true,
        },
      }),
      prisma.invoice.aggregate({
        where: {
          ...whereClause,
          status: "PAID",
        },
        _sum: {
          amountPaid: true,
        },
      }),
    ]);

    const response = {
      totalInvoices,
      unpaidInvoices,
      dueInvoices,
      paidInvoices,
      pendingInvoices,
      totalInvoiceAmount: totalInvoiceAmount._sum.amount || 0,
      totalInvoiceRevenue: totalInvoiceRevenue._sum?.amountPaid || 0,
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
