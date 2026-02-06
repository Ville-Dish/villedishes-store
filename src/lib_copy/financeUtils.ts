import prisma from "@/lib/prisma/client";

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
