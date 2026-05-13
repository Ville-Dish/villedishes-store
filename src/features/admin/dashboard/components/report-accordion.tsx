//components/custom/dashboard/report-accordion.tsx
"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { lazy, Suspense, useState } from "react";
import { MonthlySalesReport } from "./monthly-sales-report";
import { AdminReportProps } from "@/lib/types";

const QuarterlyFinancialStatement = lazy(() =>
  import("@/features/admin/dashboard/components/quarterly-financial").then(
    (module) => ({
      default: module.QuarterlyFinancialStatement,
    }),
  ),
);

const AnnualPerformanceReview = lazy(() =>
  import("@/features/admin/dashboard/components/annual-performance").then(
    (module) => ({
      default: module.AnnualPerformanceReview,
    }),
  ),
);

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

const fmt = (n: number) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const StatusBadge = ({ status }: { status: string }) => {
  const variant =
    status === "Completed"
      ? "bg-green-100 text-green-700 border-green-200"
      : status === "In Progress" || status === "In Progress (YTD)"
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : "bg-gray-100 text-gray-500 border-gray-200";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${variant}`}
    >
      {status}
    </span>
  );
};

const DialogSpinner = () => (
  <div className="h-full flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
export const ReportsSection = ({ data }: AdminReportProps) => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-muted-foreground text-lg">
          No reports available at this time
        </p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {data.map((report, index) => (
        <AccordionItem value={`item-${index}`} key={index}>
          <AccordionTrigger>{report.type}</AccordionTrigger>
          <AccordionContent>
            {/* ── Monthly Sales Report ────────────────────────────────────── */}
            {report.type === "Monthly Sales Report" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-6"
                      >
                        No monthly sales reports available
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.items.map((item, itemIndex) => {
                      const dialogKey = `${index}-${itemIndex}`;
                      return (
                        <TableRow key={itemIndex}>
                          <TableCell className="font-medium">
                            {item.date}
                          </TableCell>
                          <TableCell className="text-right">
                            <StatusBadge status={item.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog
                              open={openDialog === dialogKey}
                              onOpenChange={(isOpen) =>
                                setOpenDialog(isOpen ? dialogKey : null)
                              }
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={item.status === "Unavailable"}
                                >
                                  {item.status === "Completed"
                                    ? "View"
                                    : "Preview"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl w-full max-h-screen">
                                <DialogHeader>
                                  <DialogTitle>
                                    Monthly Sales Report — {item.date}
                                  </DialogTitle>
                                  <DialogDescription className="sr-only">
                                    Monthly sales report for {item.date}
                                  </DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="max-h-[calc(90vh-100px)] pr-4">
                                  <div className="mt-4 space-y-2">
                                    <div className="flex items-center gap-2 mb-4">
                                      <span className="text-sm text-muted-foreground">
                                        Status:
                                      </span>
                                      <StatusBadge status={item.status} />
                                    </div>
                                    {item.monthlySalesReport &&
                                    item.monthlySalesReport.monthlySales
                                      .length > 0 ? (
                                      <MonthlySalesReport
                                        {...item.monthlySalesReport}
                                      />
                                    ) : (
                                      <p className="text-sm text-muted-foreground py-4 text-center">
                                        No sales data recorded for {item.date}
                                      </p>
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
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}

            {/* ── Quarterly Financials Report ─────────────────────────────── */}
            {report.type === "Quarterly Financials Report" &&
              report.items[0].quarterlyReport && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quarter</TableHead>
                      <TableHead className="text-right">Revenue ($)</TableHead>
                      <TableHead className="text-right">Expenses ($)</TableHead>
                      <TableHead className="text-right">Profit ($)</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.items[0].quarterlyReport.monthlyData.map(
                      (quarter) => {
                        const year = parseInt(report.items[0].date);
                        const status = getQuarterStatus(quarter.quarter, year);

                        // Already filtered server-side, but guard client-side too
                        if (status === "Unavailable") return null;

                        const totalRevenue = quarter.monthlyData.reduce(
                          (s, m) => s + m.revenue,
                          0,
                        );
                        const totalExpenses = quarter.monthlyData.reduce(
                          (s, m) => s + m.expenses,
                          0,
                        );
                        const totalProfit = quarter.monthlyData.reduce(
                          (s, m) => s + m.profit,
                          0,
                        );
                        const dialogKey = `${index}-q${quarter.quarter}`;

                        return (
                          <TableRow key={quarter.quarter}>
                            <TableCell className="font-medium">
                              Q{quarter.quarter}
                            </TableCell>
                            <TableCell className="text-right">
                              {fmt(totalRevenue)}
                            </TableCell>
                            <TableCell className="text-right">
                              {fmt(totalExpenses)}
                            </TableCell>
                            <TableCell className="text-right">
                              {fmt(totalProfit)}
                            </TableCell>
                            <TableCell className="text-right">
                              <StatusBadge status={status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Dialog
                                open={openDialog === dialogKey}
                                onOpenChange={(isOpen) =>
                                  setOpenDialog(isOpen ? dialogKey : null)
                                }
                              >
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    {status === "Completed"
                                      ? "View"
                                      : "Preview"}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl w-full max-h-screen">
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
                                      <ErrorBoundary>
                                        <Suspense fallback={<DialogSpinner />}>
                                          <QuarterlyFinancialStatement
                                            monthlyData={[quarter]}
                                            expenseBreakdown={[
                                              report.items[0].quarterlyReport?.expenseBreakdown.find(
                                                (e) =>
                                                  e.quarter === quarter.quarter,
                                              ) ?? {
                                                quarter: quarter.quarter,
                                                data: [],
                                              },
                                            ]}
                                          />
                                        </Suspense>
                                      </ErrorBoundary>
                                    </div>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        );
                      },
                    )}
                  </TableBody>
                </Table>
              )}

            {/* ── Annual Performance Report ─────────────────────────────── */}
            {report.type === "Annual Performance Report" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.items.map((item, itemIndex) => {
                    const dialogKey = `${index}-${itemIndex}`;
                    const isUnavailable = item.status === "Unavailable";
                    return (
                      <TableRow key={itemIndex}>
                        <TableCell className="font-medium">
                          {item.date}
                        </TableCell>
                        <TableCell className="text-right">
                          <StatusBadge status={item.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog
                            open={openDialog === dialogKey}
                            onOpenChange={(isOpen) =>
                              setOpenDialog(isOpen ? dialogKey : null)
                            }
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isUnavailable}
                              >
                                {item.status === "Completed"
                                  ? "View"
                                  : item.status === "In Progress (YTD)"
                                    ? "View YTD"
                                    : "Preview"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl w-full max-h-screen">
                              <DialogHeader>
                                <DialogTitle>
                                  Annual Performance Report — {item.date}
                                  {item.status === "In Progress (YTD)" && (
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                      (Year to Date)
                                    </span>
                                  )}
                                </DialogTitle>
                                <DialogDescription className="sr-only">
                                  Annual performance report for {item.date}
                                </DialogDescription>
                              </DialogHeader>
                              <ScrollArea className="max-h-[calc(90vh-100px)] pr-4">
                                <div className="mt-4 space-y-2">
                                  <div className="flex items-center gap-2 mb-4">
                                    <span className="text-sm text-muted-foreground">
                                      Status:
                                    </span>
                                    <StatusBadge status={item.status} />
                                  </div>
                                  {item.annualPerformance ? (
                                    <ErrorBoundary>
                                      <Suspense fallback={<DialogSpinner />}>
                                        <AnnualPerformanceReview
                                          {...item.annualPerformance}
                                        />
                                      </Suspense>
                                    </ErrorBoundary>
                                  ) : (
                                    <p className="text-sm text-muted-foreground py-4 text-center">
                                      No data available for this report.
                                    </p>
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
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
