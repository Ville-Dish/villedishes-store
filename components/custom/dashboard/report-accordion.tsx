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

type QuarterlyProps = {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
};

type ExpenseBreakdownProps = {
  category: string;
  amount: number;
};

type QuarterlyReport = {
  quarterlyData: QuarterlyProps[];
  expenseBreakdown: ExpenseBreakdownProps[];
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

export const ReportsSection = ({ data }: AdminReportProps) => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  return (
    <Accordion type="single" collapsible className="w-full">
      {data.map((report, index) => (
        <AccordionItem value={`item-${index}`} key={index}>
          <AccordionTrigger>{report.type}</AccordionTrigger>
          <AccordionContent>
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
                          setOpenDialog(isOpen ? `${index}-${itemIndex}` : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={item.status === "In Progress"}
                          >
                            {item.action || "View"}
                          </Button>
                        </DialogTrigger>
                        {/* <ReportDialog report={report} item={item} /> */}
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
                                  monthlySales={
                                    item.monthlySalesReport.monthlySales
                                  }
                                  topProducts={
                                    item.monthlySalesReport.topProducts
                                  }
                                />
                              ) : report.type ===
                                  "Quarterly Financial Statement" &&
                                item.quarterlyReport ? (
                                <QuarterlyFinancialStatement
                                  quarterlyData={
                                    item.quarterlyReport.quarterlyData
                                  }
                                  expenseBreakdown={
                                    item.quarterlyReport.expenseBreakdown
                                  }
                                />
                              ) : report.type === "Annual Performance Review" &&
                                item.annualPerformance ? (
                                <AnnualPerformanceReview
                                  quarterlyPerformance={
                                    item.annualPerformance.quarterlyPerformance
                                  }
                                  keyMetrics={item.annualPerformance.keyMetrics}
                                />
                              ) : (
                                <p>No data available for this report.</p>
                              )}
                              <Button>Download</Button>
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
