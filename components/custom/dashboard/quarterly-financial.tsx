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

export const QuarterlyFinancialStatement = ({
  quarterlyData,
  expenseBreakdown,
}: QuarterlyReport) => {
  console.log("Quarterly Report", quarterlyData);
  console.log("Expense BreakDown", expenseBreakdown);

  const totalRevenue = quarterlyData.reduce(
    (sum, month) => sum + month.revenue,
    0
  );
  const totalExpenses = quarterlyData.reduce(
    (sum, month) => sum + month.expenses,
    0
  );
  const totalProfit = quarterlyData.reduce(
    (sum, month) => sum + month.profit,
    0
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Quarterly Financial Statement</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Financial Breakdown</CardTitle>
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
                {quarterlyData.map((month) => (
                  <TableRow key={month.month}>
                    <TableCell>{month.month}</TableCell>
                    <TableCell className="text-right">
                      {month.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {month.expenses.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {month.profit.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">
                    {totalRevenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {totalExpenses.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {totalProfit.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
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
                {expenseBreakdown.map((expense) => (
                  <TableRow key={expense.category}>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right">
                      {expense.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {((expense.amount / totalExpenses) * 100).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">
                    {totalExpenses.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
