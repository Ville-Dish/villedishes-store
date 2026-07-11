"use server";

import prisma from "./prisma/client";

export const generateInvoiceNumber = async () => {
  const maxInvoice = await prisma.invoice.findFirst({
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });

  let nextNumber = 1;

  if (maxInvoice?.invoiceNumber) {
    const numericPart = parseInt(maxInvoice.invoiceNumber.split("-")[1], 10);
    if (!isNaN(numericPart)) {
      nextNumber = numericPart + 1;
    }
  }

  return `INV-${String(nextNumber).padStart(4, "0")}`;
};

export const generateOrderNumber = async () => {
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
};

export async function calculateMonthlyRevenue(year: number, month: number) {
  // const startDate = new Date(year, month - 1, 1);
  // const endDate = new Date(year, month, 0);

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

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
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
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
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
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
    0,
  );
  const incomeTotal = incomes.reduce((sum, income) => sum + income.amount, 0);

  return orderTotal + invoiceTotal + incomeTotal;
}

export const addHours = (date: Date | string, hours: number) => {
  return new Date(new Date(date).getTime() + hours * 60 * 60 * 1000);
};

export const calculateEstimatedDelivery = (date: string | Date) => {
  const base = new Date(date);
  if (isNaN(base.getTime())) return "Invalid Date";
  return new Date(base.getTime() + 48 * 3600000).toISOString().split("T")[0];
};
