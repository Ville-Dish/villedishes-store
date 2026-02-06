//components/custom/dashboard/monthly-sales-report.tsx

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

export const MonthlySalesReport = ({
  monthlySales,
  topProducts,
}: MonthlySalesReport) => {
  if (!monthlySales || monthlySales.length === 0) {
    return <p>No data available for the Monthly Sales Report.</p>;
  }
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Sales Breakdown</CardTitle>
          <CardDescription>
            Detailed view of sales performance by week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Week</TableHead>
                <TableHead className="text-right">Sales ($)</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Avg. Order Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlySales.map((week) => (
                <TableRow key={week.week}>
                  <TableCell>{week.week}</TableCell>
                  <TableCell className="text-right">
                    {week.sales.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">{week.orders}</TableCell>
                  <TableCell className="text-right">
                    {week.averageOrderValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {topProducts && topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performers this month</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Revenue ($)</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product) => (
                  <TableRow key={product.name}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right">
                      {product.sales}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.revenue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.unitsSold}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
