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

export const AnnualPerformanceReview = ({
  quarterlyPerformance,
  keyMetrics,
}: AnnualPerformance) => {
  console.log("Quarterly Performance", quarterlyPerformance);
  console.log("Key Metrics", keyMetrics);
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Annual Performance Review</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quarterly Performance</CardTitle>
            <CardDescription>
              Sales, Targets, and Satisfaction Scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quarter</TableHead>
                  <TableHead className="text-right">Sales ($)</TableHead>
                  <TableHead className="text-right">Target ($)</TableHead>
                  <TableHead className="text-right">Performance</TableHead>
                  <TableHead className="text-right">
                    Customer Satisfaction
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quarterlyPerformance.map((quarter) => (
                  <TableRow key={quarter.quarter}>
                    <TableCell>{quarter.quarter}</TableCell>
                    <TableCell className="text-right">
                      {quarter.sales.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {quarter.target.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {((quarter.sales / quarter.target) * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {quarter.customerSatisfaction.toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Performance Metrics</CardTitle>
            <CardDescription>
              Annual overview of critical business metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keyMetrics.map((item) => (
                  <TableRow key={item.metric}>
                    <TableCell>{item.metric}</TableCell>
                    <TableCell className="text-right">{item.value}</TableCell>
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
