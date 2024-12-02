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
      dateCreated: {
        gte: startDate,
        lte: endDate,
      },
    };

    const totalInvoices = await prisma.invoice.count({
      where: whereClause,
    });

    const unpaidInvoices = await prisma.invoice.count({
      where: {
        ...whereClause,
        status: "UNPAID",
      },
    });

    const dueInvoices = await prisma.invoice.count({
      where: {
        ...whereClause,
        status: "DUE",
      },
    });

    const paidInvoices = await prisma.invoice.count({
      where: {
        ...whereClause,
        status: "PAID",
      },
    });

    const pendingInvoices = await prisma.invoice.count({
      where: {
        ...whereClause,
        status: "PENDING",
      },
    });

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      orderBy: { dateCreated: "desc" },
      include: {
        InvoiceProducts: {
          include: {
            Product: true,
          },
        },
      },
    });

    const totalInvoiceAmount = await prisma.invoice.aggregate({
      where: whereClause,
      _sum: {
        amount: true,
      },
    });

    const totalInvoiceRevenue = await prisma.invoice.aggregate({
      where: {
        ...whereClause,
        status: "PAID",
      },
      _sum: {
        amount: true,
      },
    });

    const response = {
      totalInvoices,
      unpaidInvoices,
      dueInvoices,
      paidInvoices,
      pendingInvoices,
      totalInvoiceAmount: totalInvoiceAmount._sum.amount || 0,
      totalInvoiceRevenue: totalInvoiceRevenue._sum?.amount || 0,
      invoices,
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
