/* // app/api/dashboard/quarterly-financials/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

// interface RawMonthlyData {
//   month: bigint;
//   revenue: bigint;
//   expenses: bigint;
//   profit: bigint;
// }

interface MonthlyData {
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ExpenseBreakdown {
  category: string;
  amount: number;
}

//update to fetch for all the quarter in the current year

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString()
    );

    const startDate = new Date(year, 0, 1).toISOString();
    const endDate = new Date(year, 11, 31).toISOString();

    // Fetch monthly financial data:
    // Fetch orders
    const orders = await prisma.order.groupBy({
      by: ["orderDate"],
      where: {
        orderDate: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ["PENDING", "FULFILLED"],
        },
      },
      _sum: {
        total: true,
        tax: true,
      },
    });

    // Fetch invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        dateCreated: {
          gte: startDate,
          lte: endDate,
        },
        status: "PAID",
      },
      select: {
        dateCreated: true,
        amount: true,
        taxRate: true,
      },
    });

    // Fetch income
    const income = await prisma.income.groupBy({
      by: ["date"],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Fetch expenses
    const expenses = await prisma.expense.groupBy({
      by: ["date", "category"],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Process data
    const monthlyData: { [key: number]: MonthlyData } = {};
    const expenseBreakdown: { [key: string]: number } = {};

    for (let month = 1; month <= 12; month++) {
      monthlyData[month] = { month, revenue: 0, expenses: 0, profit: 0 };
    }

    orders.forEach((order) => {
      const date = order.orderDate ? new Date(order.orderDate) : new Date();
      const month = date.getMonth() + 1;
      monthlyData[month].revenue += order._sum.total || 0;
      monthlyData[month].expenses += order._sum.tax || 0;
    });

    invoices.forEach((invoice) => {
      const month = new Date(invoice.dateCreated).getMonth() + 1;
      const amount = invoice.amount;
      const tax = (amount * invoice.taxRate) / 100;
      monthlyData[month].revenue += amount;
      monthlyData[month].expenses += tax;
      expenseBreakdown["Tax"] = (expenseBreakdown["Tax"] || 0) + tax;
    });

    income.forEach((inc) => {
      const month = new Date(inc.date).getMonth() + 1;
      monthlyData[month].revenue += inc._sum.amount || 0;
    });

    expenses.forEach((expense) => {
      const month = new Date(expense.date).getMonth() + 1;
      const amount = expense._sum.amount || 0;
      monthlyData[month].expenses += amount;
      expenseBreakdown[expense.category] =
        (expenseBreakdown[expense.category] || 0) + amount;
    });

    // Calculate profit
    Object.values(monthlyData).forEach((data) => {
      data.profit = data.revenue - data.expenses;
    });

    const formattedMonthlyData: MonthlyData[] = Object.values(monthlyData);
    const formattedExpenseBreakdown: ExpenseBreakdown[] = Object.entries(
      expenseBreakdown
    ).map(([category, amount]) => ({
      category,
      amount,
    }));

    //Group data by quarter
    const quarterlyData = formattedMonthlyData.reduce((acc, month) => {
      const quarter = Math.ceil(month.month / 3);
      if (!acc[quarter]) {
        acc[quarter] = { revenue: 0, expenses: 0, profit: 0 };
      }
      acc[quarter].revenue += month.revenue;
      acc[quarter].expenses += month.expenses;
      acc[quarter].profit += month.profit;

      return acc;
    }, {} as { [key: number]: { revenue: number; expenses: number; profit: number } });

    return NextResponse.json({
      monthlyData: formattedMonthlyData,
      quarterlyData: Object.entries(quarterlyData).map(([quarter, data]) => ({
        quarter: parseInt(quarter),
        ...data,
      })),
      expenseBreakdown: formattedExpenseBreakdown,
    });
  } catch (error) {
    console.error("Error fetching quarterly financial statement:", error);
    return NextResponse.json(
      { message: "Error fetching quarterly financial statement", error },
      { status: 500 }
    );
  }
}
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

interface MonthlyData {
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ExpenseBreakdown {
  category: string;
  amount: number;
}

interface QuarterlyData {
  quarter: number;
  monthlyData: MonthlyData[];
}

interface QuarterlyExpenseBreakdown {
  quarter: number;
  data: ExpenseBreakdown[];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString()
    );

    const startDate = new Date(year, 0, 1).toISOString();
    const endDate = new Date(year, 11, 31).toISOString();

    // Fetch orders
    const orders = await prisma.order.groupBy({
      by: ["orderDate"],
      where: {
        orderDate: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ["PENDING", "FULFILLED"],
        },
      },
      _sum: {
        total: true,
        tax: true,
      },
    });

    // Fetch invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        dateCreated: {
          gte: startDate,
          lte: endDate,
        },
        status: "PAID",
      },
      select: {
        dateCreated: true,
        amount: true,
        taxRate: true,
      },
    });

    // Fetch income
    const income = await prisma.income.groupBy({
      by: ["date"],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Fetch expenses
    const expenses = await prisma.expense.groupBy({
      by: ["date", "category"],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Process data
    const monthlyData: { [key: number]: MonthlyData } = {};
    const expenseBreakdown: { [key: number]: { [key: string]: number } } = {};

    for (let month = 1; month <= 12; month++) {
      monthlyData[month] = { month, revenue: 0, expenses: 0, profit: 0 };
      expenseBreakdown[month] = {};
    }

    orders.forEach((order) => {
      const date = order.orderDate ? new Date(order.orderDate) : new Date();
      const month = date.getMonth() + 1;
      monthlyData[month].revenue += Number(order._sum.total) || 0;
      monthlyData[month].expenses += Number(order._sum.tax) || 0;
    });

    invoices.forEach((invoice) => {
      const month = new Date(invoice.dateCreated).getMonth() + 1;
      const amount = Number(invoice.amount);
      const tax = (amount * invoice.taxRate) / 100;
      monthlyData[month].revenue += amount;
      monthlyData[month].expenses += tax;
      expenseBreakdown[month]["Tax"] =
        (expenseBreakdown[month]["Tax"] || 0) + tax;
    });

    income.forEach((inc) => {
      const month = new Date(inc.date).getMonth() + 1;
      monthlyData[month].revenue += Number(inc._sum.amount) || 0;
    });

    expenses.forEach((expense) => {
      const month = new Date(expense.date).getMonth() + 1;
      const amount = Number(expense._sum.amount) || 0;
      monthlyData[month].expenses += amount;
      expenseBreakdown[month][expense.category] =
        (expenseBreakdown[month][expense.category] || 0) + amount;
    });

    // Calculate profit
    Object.values(monthlyData).forEach((data) => {
      data.profit = data.revenue - data.expenses;
    });

    // Group data by quarter
    const quarterlyData: QuarterlyData[] = [1, 2, 3, 4].map((quarter) => ({
      quarter,
      monthlyData: Object.values(monthlyData)
        .filter((month) => Math.ceil(month.month / 3) === quarter)
        .map((month) => ({
          month: month.month,
          revenue: Number(month.revenue.toFixed(2)),
          expenses: Number(month.expenses.toFixed(2)),
          profit: Number(month.profit.toFixed(2)),
        })),
    }));

    // Group expense breakdown by quarter
    const quarterlyExpenseBreakdown: QuarterlyExpenseBreakdown[] = [
      1, 2, 3, 4,
    ].map((quarter) => ({
      quarter,
      data: Object.entries(
        Object.entries(expenseBreakdown)
          .filter(([month]) => Math.ceil(parseInt(month) / 3) === quarter)
          .reduce((acc, [, monthExpenses]) => {
            Object.entries(monthExpenses).forEach(([category, amount]) => {
              acc[category] = (acc[category] || 0) + amount;
            });
            return acc;
          }, {} as { [key: string]: number })
      ).map(([category, amount]) => ({
        category,
        amount: Number(amount.toFixed(2)),
      })),
    }));

    return NextResponse.json({
      monthlyData: quarterlyData,
      expenseBreakdown: quarterlyExpenseBreakdown,
    });
  } catch (error) {
    console.error("Error fetching quarterly financial statement:", error);
    return NextResponse.json(
      { message: "Error fetching quarterly financial statement", error },
      { status: 500 }
    );
  }
}
