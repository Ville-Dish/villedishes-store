"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function generateInvoiceNumber() {
  return await prisma.$transaction(async (tx) => {
    const maxInvoice = await tx.invoice.findFirst({
      orderBy: {
        invoiceNumber: "desc",
      },
      select: {
        invoiceNumber: true,
      },
    });

    let nextNumber = 1;
    if (maxInvoice?.invoiceNumber) {
      const numericPart = parseInt(maxInvoice.invoiceNumber.split("-")[1], 10);
      if (!isNaN(numericPart)) {
        nextNumber = numericPart + 1;
      }
    }

    const newInvoiceNumber = `INV-${String(nextNumber).padStart(4, "0")}`;

    // Create a placeholder invoice to reserve the number
    await tx.invoice.create({
      data: {
        invoiceNumber: newInvoiceNumber,
        customerName: "Placeholder",
        customerEmail: "placeholder@example.com",
        customerPhone: "0000000000",
        amount: 0,
        amountPaid: 0,
        amountDue: 0,
        discountPercentage: 0,
        status: "PENDING",
        dateCreated: new Date().toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
      },
    });

    return newInvoiceNumber;
  });
}

export async function generateOrderNumber() {
  return await prisma.$transaction(async (tx) => {
    const maxOrder = await tx.order.findFirst({
      where: {
        orderNumber: {
          startsWith: "ORD-",
        },
      },
      orderBy: {
        orderNumber: "desc",
      },
      select: {
        orderNumber: true,
      },
    });

    let nextNumber = 1;
    if (maxOrder?.orderNumber) {
      const numericPart = parseInt(maxOrder.orderNumber.split("-")[1], 10);
      if (!isNaN(numericPart)) {
        nextNumber = numericPart + 1;
      }
    }

    return `ORD-${String(nextNumber).padStart(4, "0")}`;
  });
}

export async function calculateMonthlyRevenue(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const [orders, invoices, incomes] = await Promise.all([
    prisma.order.findMany({
      where: {
        orderDate: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
        status: {
          in: ["PENDING", "FULFILLED"],
        },
      },
      select: {
        total: true,
      },
    }),
    prisma.invoice.findMany({
      where: {
        dateCreated: {
          gte: startDate.toISOString().split("T")[0],
          lte: endDate.toISOString().split("T")[0],
        },
        status: "PAID",
      },
      select: {
        amount: true,
      },
    }),
    prisma.income.findMany({
      where: {
        date: {
          gte: startDate.toISOString().split("T")[0],
          lte: endDate.toISOString().split("T")[0],
        },
      },
      select: {
        amount: true,
      },
    }),
  ]);

  const orderTotal = orders.reduce((sum, order) => sum + order.total, 0);
  const invoiceTotal = invoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0
  );
  const incomeTotal = incomes.reduce((sum, income) => sum + income.amount, 0);

  return orderTotal + invoiceTotal + incomeTotal;
}
