// api/invoices/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const year = parseInt(searchParams.get("year") || currentYear.toString());
    const month = parseInt(
      searchParams.get("month") || currentMonth.toString()
    );

    if (isNaN(year) || isNaN(month)) {
      throw new Error("Invalid year or month parameter");
    }

    const projectedRevenue = await prisma.revenue.findFirst({
      where: {
        year: year,
      },
      select: {
        yearlyTarget: true,
      },
    });

    const totalActualRevenue = await prisma.monthlyProjection.aggregate({
      where: {
        revenue: {
          year: year,
        },
      },
      _sum: {
        actual: true,
      },
    });

    const yearlyRevenueData = {
      projected: projectedRevenue?.yearlyTarget || 0,
      actual: totalActualRevenue._sum.actual || 0,
    };

    const totalMonthlyRevenue = await prisma.monthlyProjection.findFirst({
      where: {
        month: monthNames[month],
        revenue: {
          year: year,
        },
      },
      select: {
        actual: true,
      },
    });

    const monthlyRevenue = await prisma.monthlyProjection.findFirst({
      where: {
        month: monthNames[month - 1],
        revenue: { year: year },
      },
      select: {
        projection: true,
        actual: true,
      },
    });

    const monthlyRevenueData = {
      projected: monthlyRevenue?.projection || 0,
      actual: monthlyRevenue?.actual || 0,
    };

    const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
    const endDate = `${year}-${month.toString().padStart(2, "0")}-31`;

    const totalMonthlyExpense = await prisma.expense.aggregate({
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

    const profit =
      (totalMonthlyRevenue?.actual || 0) -
      (totalMonthlyExpense._sum.amount || 0);

    const profitData = {
      totalRevenue: totalMonthlyRevenue?.actual,
      profit: profit,
    };

    const incomeData = await prisma.income.groupBy({
      by: ["category"],
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

    const expenseData = await prisma.expense.groupBy({
      by: ["category"],
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

    const response = {
      yearlyRevenueData: yearlyRevenueData,
      monthlyRevenueData: monthlyRevenueData,
      profitData: profitData,
      incomeData: incomeData.map((item) => ({
        category: item.category,
        amount: item._sum.amount,
      })),
      expenseData: expenseData.map((item) => ({
        category: item.category,
        amount: item._sum.amount,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching invoice data:", error);
    return NextResponse.json(
      { message: "Error fetching invoice data", error },
      { status: 500 }
    );
  }
}
