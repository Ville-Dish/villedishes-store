//components/custom/dashboard/quarterly-financial.tsx
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

type QuarterlyReport = {
  monthlyData: QuarterlyData[];
  expenseBreakdown: QuarterlyExpenseBreakdown[];
};

export const QuarterlyFinancialStatement = ({
  monthlyData,
  expenseBreakdown,
}: QuarterlyReport) => {
  if (!monthlyData || monthlyData.length === 0) {
    return <p>No data available for the Quarterly Financial Statement.</p>;
  }

  const quarter = monthlyData[0];
  const expenses = expenseBreakdown[0]?.data || [];

  const totalRevenue = quarter.monthlyData.reduce(
    (sum, month) => sum + month.revenue,
    0
  );
  const totalExpenses = quarter.monthlyData.reduce(
    (sum, month) => sum + month.expenses,
    0
  );
  const totalProfit = quarter.monthlyData.reduce(
    (sum, month) => sum + month.profit,
    0
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Q{quarter.quarter} Monthly Breakdown</CardTitle>
          <CardDescription>
            Revenue, Expenses, and Profit by Month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Revenue ($)</TableHead>
                <TableHead className="text-right">Expenses ($)</TableHead>
                <TableHead className="text-right">Profit ($)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quarter.monthlyData.map((month) => (
                <TableRow key={month.month}>
                  <TableCell>{monthNames[month.month - 1]}</TableCell>
                  <TableCell className="text-right">
                    {month.revenue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {month.expenses.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {month.profit.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">
                  {totalRevenue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {totalExpenses.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {totalProfit.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Q{quarter.quarter} Expense Breakdown</CardTitle>
            <CardDescription>
              Detailed view of quarterly expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount ($)</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.category}>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right">
                      {expense.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {((expense.amount / totalExpenses) * 100).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">
                    {totalExpenses.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    100.00%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
