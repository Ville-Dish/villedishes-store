//components/custom/dashboard/report-accordion.tsx
"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MonthlySalesReport } from "./monthly-sales-report";
import { QuarterlyFinancialStatement } from "./quarterly-financial";
import { AnnualPerformanceReview } from "./annual-performance";
import { ScrollArea } from "@/components/ui/scroll-area";

type MonthlySales = {
  week: string;
  sales: number;
  orders: number;
  averageOrderValue: number;
};

type TopProducts = {
  name: string;
  sales: number;
  revenue: number;
  unitsSold: number;
};

type MonthlySalesReport = {
  monthlySales: MonthlySales[];
  topProducts: TopProducts[];
};

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

type QuarterlyPerformanceProps = {
  quarter: string;
  sales: number;
  target: number;
  customerSatisfaction: number;
};

type KeyMetricsProps = {
  metric: string;
  value: string;
};

type AnnualPerformance = {
  quarterlyPerformance: QuarterlyPerformanceProps[];
  keyMetrics: KeyMetricsProps[];
};

type ReportItem = {
  date: string;
  status: string;
  action?: string;
  monthlySalesReport?: MonthlySalesReport;
  quarterlyReport?: QuarterlyReport;
  annualPerformance?: AnnualPerformance;
};

type ReportData = {
  type: string;
  items: ReportItem[];
};

type AdminReportProps = {
  data: ReportData[];
};

const getQuarterStatus = (quarter: number, year: number) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;

  if (
    year < currentYear ||
    (year === currentYear && quarter < currentQuarter)
  ) {
    return "Completed";
  } else if (year === currentYear && quarter === currentQuarter) {
    return "In Progress";
  } else {
    return "Unavailable";
  }
};

export const ReportsSection = ({ data }: AdminReportProps) => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="no-data">
          <AccordionTrigger className="text-xl font-bold">
            Reports
          </AccordionTrigger>
          <AccordionContent>
            <p>No data available</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {data.map((report, index) => (
        <AccordionItem value={`item-${index}`} key={index}>
          <AccordionTrigger>{report.type}</AccordionTrigger>
          <AccordionContent>
            {report.type === "Quarterly Financials Report" &&
            report.items[0]?.quarterlyReport ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quarter</TableHead>
                    <TableHead className="text-right">Revenue ($)</TableHead>
                    <TableHead className="text-right">Expenses ($)</TableHead>
                    <TableHead className="text-right">Profit ($)</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.items[0].quarterlyReport.monthlyData.map(
                    (quarter) => {
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

                      const year = parseInt(report.items[0].date);
                      const status = getQuarterStatus(quarter.quarter, year);

                      return (
                        <TableRow key={quarter.quarter}>
                          <TableCell>Q{quarter.quarter}</TableCell>
                          <TableCell className="text-right">
                            {totalRevenue.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            {totalExpenses.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            {totalProfit.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-right">{status}</TableCell>
                          <TableCell className="text-right">
                            <Dialog
                              open={
                                openDialog === `${index}-${quarter.quarter}`
                              }
                              onOpenChange={(isOpen) =>
                                setOpenDialog(
                                  isOpen ? `${index}-${quarter.quarter}` : null
                                )
                              }
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={status === "Unavailable"}
                                >
                                  {status === "Completed" ? "View" : "Preview"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl w-full max-h-[100vh]">
                                <DialogHeader>
                                  <DialogTitle>
                                    Q{quarter.quarter} {report.items[0].date}{" "}
                                    Detailed Breakdown
                                  </DialogTitle>
                                  <DialogDescription className="sr-only">
                                    Quarterly financial report for Q
                                    {quarter.quarter} {report.items[0].date}
                                  </DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="max-h-[calc(90vh-100px)] pr-4">
                                  <div className="mt-4">
                                    <QuarterlyFinancialStatement
                                      monthlyData={[quarter]}
                                      expenseBreakdown={[
                                        report.items[0].quarterlyReport?.expenseBreakdown.find(
                                          (e) => e.quarter === quarter.quarter
                                        ) || {
                                          quarter: quarter.quarter,
                                          data: [],
                                        },
                                      ]}
                                    />
                                  </div>
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.items.map((item, itemIndex) => (
                    <TableRow key={itemIndex}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>
                        <Dialog
                          open={openDialog === `${index}-${itemIndex}`}
                          onOpenChange={(isOpen) =>
                            setOpenDialog(
                              isOpen ? `${index}-${itemIndex}` : null
                            )
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={item.status === "Unavailable"}
                            >
                              {item.status === "Completed" ? "View" : "Preview"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl w-full max-h-[100vh]">
                            <DialogHeader>
                              <DialogTitle>
                                {report.type} - {item.date}
                              </DialogTitle>
                              <DialogDescription className="sr-only">
                                {report.type} report for {item.date}
                              </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[calc(90vh-100px)] pr-4">
                              <div className="mt-4">
                                <p>
                                  <strong>Status:</strong> {item.status}
                                </p>
                                <p>
                                  <strong>Date:</strong> {item.date}
                                </p>
                                {report.type === "Monthly Sales Report" &&
                                item.monthlySalesReport ? (
                                  <MonthlySalesReport
                                    {...item.monthlySalesReport}
                                  />
                                ) : report.type ===
                                    "Annual Performance Report" &&
                                  item.annualPerformance ? (
                                  <AnnualPerformanceReview
                                    {...item.annualPerformance}
                                  />
                                ) : (
                                  <p>No data available for this report.</p>
                                )}
                                {item.status === "Completed" && (
                                  <Button className="mt-4">Download</Button>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
