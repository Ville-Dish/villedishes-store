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
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Monthly Sales Report</h1>

      <div className="grid gap-6">
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
                  <TableHead className="text-right">
                    Avg. Order Value ($)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlySales.map((week) => (
                  <TableRow key={week.week}>
                    <TableCell>{week.week}</TableCell>
                    <TableCell className="text-right">
                      {week.sales.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{week.orders}</TableCell>
                    <TableCell className="text-right">
                      {week.averageOrderValue.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
                  <TableHead className="text-right">Sales ($)</TableHead>
                  <TableHead className="text-right">Revenue ($)</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product) => (
                  <TableRow key={product.name}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right">
                      {product.sales.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.revenue.toLocaleString()}
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
      </div>
    </div>
  );
};
