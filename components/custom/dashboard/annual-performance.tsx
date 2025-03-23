//components/custom/dashboard/annual-performance.tsx

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
  if (!quarterlyPerformance || quarterlyPerformance.length === 0) {
    return <p>No data available for the Annual Performance Review.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Performance</CardTitle>
          <CardDescription>
            Sales, Target, and Customer Satisfaction Scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quarter</TableHead>
                <TableHead className="text-right">Sales ($)</TableHead>
                <TableHead className="text-right">Target ($)</TableHead>
                <TableHead className="text-right">
                  Customer Satisfaction
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quarterlyPerformance.map((quarter) => (
                <TableRow key={quarter.quarter}>
                  <TableCell>Q{quarter.quarter}</TableCell>
                  <TableCell className="text-right">
                    {quarter.sales.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {quarter.target.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {quarter.customerSatisfaction.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {keyMetrics && keyMetrics.length > 0 && (
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
      )}
    </div>
  );
};
