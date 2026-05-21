import prisma from "@/lib/prisma/client";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";

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

export const dashboardProcedures = createTRPCRouter({
  overviewData: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      // Destructure input parameters
      const { startDate, endDate, limit } = input;

      // Calculate default start and end dates
      const today = new Date();
      const defaultStartDate = new Date(today);
      defaultStartDate.setDate(today.getDate() - 30);

      const finalStartDate = startDate
        ? new Date(startDate)
        : new Date(defaultStartDate);

      const finalEndDate = endDate ? new Date(endDate) : new Date(today);

      // Construct the where clause
      const whereOrderClause = {
        orderDate: {
          gte: finalStartDate,
          lte: finalEndDate,
        },
      };

      const whereInvoiceClause = {
        dateCreated: {
          gte: finalStartDate.toISOString(),
          lte: finalEndDate.toISOString(),
        },
      };

      const whereIncomeClause = {
        date: {
          gte: finalStartDate.toISOString(),
          lte: finalEndDate.toISOString(),
        },
      };

      // Placeholder for actual data fetching logic
      const [
        rawRecentOrdersData,
        orderStatusStats,
        orderRevenue,
        invoiceStatusStats,
        invoiceRevenue,
        incomeRevenue,
      ] = await Promise.all([
        // Fetch recent orders
        prisma.order.findMany({
          where: whereOrderClause,
          take: limit || 5,
          orderBy: { orderDate: "desc" },
          select: {
            id: true,
            orderNumber: true,
            orderDate: true,
            total: true,
            status: true,
            shippingInfo: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        }),

        // Fetch orders status counts: Order counts grouped by status
        prisma.order.groupBy({
          by: ["status"],
          where: whereOrderClause,
          _count: {
            status: true,
          },
        }),

        // Fetch orders revenue
        prisma.order.aggregate({
          _sum: { total: true },
          where: {
            ...whereOrderClause,
            status: {
              notIn: ["UNVERIFIED", "CANCELLED", "CANCELLATION_REQUESTED"],
            },
          },
        }),

        // Fetch invoice status counts: Invoice counts grouped by status
        prisma.invoice.groupBy({
          by: ["status"],
          where: whereInvoiceClause,
          _count: {
            status: true,
          },
        }),

        // Fetch invoice revenue
        prisma.invoice.aggregate({
          _sum: { amountPaid: true },
          where: {
            ...whereInvoiceClause,
            status: "PAID",
          },
        }),

        // Fetch income revenue
        prisma.income.aggregate({
          _sum: { amount: true },
          where: {
            ...whereIncomeClause,
          },
        }),
      ]);

      // Transform order status counts into a more usable format
      const orderStats = orderStatusStats.reduce(
        (acc, curr) => {
          acc[curr.status] = curr._count.status;
          return acc;
        },
        {} as Record<string, number>,
      );

      const totalOrders = Object.values(orderStats).reduce((a, b) => a + b, 0);

      const unVerifiedOrders = orderStats.UNVERIFIED ?? 0;
      const pendingOrders = orderStats.PENDING ?? 0;

      // Transform invoice status results
      const invoiceStats = invoiceStatusStats.reduce(
        (acc, curr) => {
          acc[curr.status] = curr._count.status;
          return acc;
        },
        {} as Record<string, number>,
      );

      const totalInvoices = Object.values(invoiceStats).reduce(
        (a, b) => a + b,
        0,
      );

      const unpaidInvoices = invoiceStats.UNPAID ?? 0;
      const dueInvoices = invoiceStats.DUE ?? 0;

      const recentOrders = rawRecentOrdersData.map((order) => ({
        customer: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
        order: order.orderNumber ?? order.id,
        orderDate: order.orderDate!.toISOString(),
        total: order.total,
      }));

      const totalRevenue =
        (orderRevenue._sum.total || 0) +
        (invoiceRevenue._sum.amountPaid || 0) +
        (incomeRevenue._sum.amount || 0);

      return {
        totalRevenue,
        recentOrders,
        totalOrders,
        unVerifiedOrders,
        pendingOrders,
        totalInvoices,
        unpaidInvoices,
        dueInvoices,
      };
    }),

  performanceMetricsData: protectedProcedure
    .input(
      z.object({
        year: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      const currentYear = new Date().getFullYear();
      const year = input.year || currentYear;

      const startDate = new Date(year, 0, 1).toISOString();
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999).toISOString();

      const monthOrder = [
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

      // Fetch monthly revenue projections for the specified year
      const [rawMonthlyRevenue, orderProducts, invoiceProducts] =
        await Promise.all([
          // Monthly revenue projections
          prisma.monthlyProjection.findMany({
            where: {
              revenue: { year },
            },
            select: {
              month: true,
              actual: true,
            },
          }),

          // Order products aggregated
          prisma.orderProduct.groupBy({
            by: ["productId"],
            where: {
              order: {
                orderDate: {
                  gte: startDate,
                  lte: endDate,
                },
                status: {
                  in: ["PENDING", "FULFILLED", "DELIVERED", "SHIPPED"],
                },
              },
            },
            _sum: { quantity: true },
          }),

          // Invoice products aggregated
          prisma.invoiceProducts.findMany({
            where: {
              invoice: {
                dateCreated: {
                  gte: startDate,
                  lte: endDate,
                },
                status: "PAID",
              },
            },
            select: {
              quantity: true,
              Product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          }),
        ]);

      const monthlyRevenue = rawMonthlyRevenue.sort(
        (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month),
      );

      // combine quantities
      const productQuantities = new Map<string, number>();
      const productNames = new Map<string, string>();

      for (const orderProduct of orderProducts) {
        productQuantities.set(
          orderProduct.productId,
          orderProduct._sum.quantity ?? 0,
        );
      }

      // Invoice aggregation
      for (const invoiceProduct of invoiceProducts) {
        for (const product of invoiceProduct.Product) {
          productNames.set(product.id, product.name);

          productQuantities.set(
            product.id,
            (productQuantities.get(product.id) ?? 0) + invoiceProduct.quantity,
          );
        }
      }

      // Fetch missing product names
      const missingIds = [...productQuantities.keys()].filter(
        (id) => !productNames.has(id),
      );

      if (missingIds.length > 0) {
        const products = await prisma.product.findMany({
          where: { id: { in: missingIds } },
          select: { id: true, name: true },
        });

        for (const product of products) {
          productNames.set(product.id, product.name);
        }
      }

      const productPerformanceData = [...productQuantities.entries()]
        .map(([id, value]) => ({
          name: productNames.get(id) ?? id,
          value,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const revenueGrowthData = monthlyRevenue.map(({ month, actual }) => ({
        month, // <-- already matches chart
        revenue: Number(actual.toFixed(1)),
      }));

      return {
        productPerformanceData,
        revenueGrowthData,
      };
    }),

  analyticsChartData: protectedProcedure
    .input(
      z.object({
        year: z.number().optional(),
        month: z.number().min(1).max(12).optional(),
      }),
    )
    .query(async ({ input }) => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const year = input.year || currentYear;
      const month = input.month || currentMonth;

      // const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
      // const endDate = `${year}-${month.toString().padStart(2, "0")}-31`;

      const startDate = new Date(year, month - 1, 1); // e.g. 2026-05-01T00:00:00.000Z
      const endDate = new Date(year, month, 0, 23, 59, 59, 999); // last day of month, end of day

      const [
        projectedRevenue,
        totalMonthlyRevenue,
        monthlyRevenue,
        totalActualRevenue,
        totalMonthlyExpense,
        incomeData,
        expenseData,
      ] = await Promise.all([
        // Yearly revenue target
        prisma.revenue.findFirst({
          where: { year },
          select: { yearlyTarget: true },
        }),

        // Current month's actual revene
        prisma.monthlyProjection.findFirst({
          where: {
            month: monthNames[month - 1],
            revenue: { year },
          },
          select: { actual: true },
        }),

        // Current month's projection vs actual
        prisma.monthlyProjection.findFirst({
          where: {
            month: monthNames[month - 1],
            revenue: { year },
          },
          select: {
            projection: true,
            actual: true,
          },
        }),

        // Total actual revenue for the year + monthly expenses
        prisma.monthlyProjection.aggregate({
          where: { revenue: { year } },
          _sum: { actual: true },
        }),
        prisma.expense.aggregate({
          where: {
            date: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        }),

        // Income grouped by category for the month
        prisma.income.groupBy({
          by: ["category"],
          where: {
            date: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        }),

        // Expenses grouped by category for the month
        prisma.expense.groupBy({
          by: ["category"],
          where: {
            date: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        }),
      ]);

      // Shape data to match AnalyticsTab expectations exactly
      const yearlyRevenueData = {
        projected: projectedRevenue?.yearlyTarget ?? 0,
        actual: totalActualRevenue._sum.actual ?? 0,
      };

      const monthlyRevenueData = {
        projected: monthlyRevenue?.projection ?? 0,
        actual: monthlyRevenue?.actual ?? 0,
      };

      const rawProfit =
        (totalMonthlyRevenue?.actual ?? 0) -
        (totalMonthlyExpense._sum.amount ?? 0);

      const profitData = {
        totalRevenue: totalMonthlyRevenue?.actual ?? 0,
        // Clamp to 0 so the pie chart never receives a negative slice
        profit: rawProfit < 0 ? 0 : rawProfit,
      };

      // Transform to { category, value } — matches CategoryData in pie-chart.tsx
      const transformedIncomeData = incomeData.map((item) => ({
        category: item.category,
        value: item._sum.amount ?? 0,
      }));

      const transformedExpenseData = expenseData.map((item) => ({
        category: item.category,
        value: item._sum.amount ?? 0,
      }));

      return {
        yearlyRevenueData,
        monthlyRevenueData,
        profitData,
        incomeData: transformedIncomeData,
        expenseData: transformedExpenseData,
      };
    }),

  reportData: protectedProcedure
    .input(
      z.object({
        year: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      const now = new Date();
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const year = input.year ?? currentYear;

      // ─── Helpers ────────────────────────────────────────────────────────────

      const shortMonthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const fullMonthNames = [
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

      // Monthly status: past month = Completed, current = In Progress, future = Unavailable
      const getMonthStatus = (
        m: number,
      ): "Completed" | "In Progress" | "Unavailable" => {
        if (year < currentYear || (year === currentYear && m < currentMonth))
          return "Completed";
        if (year === currentYear && m === currentMonth) return "In Progress";
        return "Unavailable";
      };

      // Quarterly status
      const getQuarterStatus = (
        q: number,
      ): "Completed" | "In Progress" | "Unavailable" => {
        const lastMonthOfQuarter = q * 3;
        if (
          year < currentYear ||
          (year === currentYear && lastMonthOfQuarter < currentMonth)
        )
          return "Completed";
        if (
          year === currentYear &&
          lastMonthOfQuarter >= currentMonth &&
          (q - 1) * 3 < currentMonth
        )
          return "In Progress";
        return "Unavailable";
      };

      // Annual status: past/current year = available (current shown as YTD), future = Unavailable
      const getAnnualStatus = ():
        | "Completed"
        | "In Progress (YTD)"
        | "Unavailable" => {
        if (year < currentYear) return "Completed";
        if (year === currentYear) return "In Progress (YTD)";
        return "Unavailable";
      };

      // ─── Date ranges ────────────────────────────────────────────────────────

      const yearStart = new Date(year, 0, 1).toISOString();
      const yearEnd = new Date(year, 11, 31, 23, 59, 59).toISOString();

      // ════════════════════════════════════════════════════════════════════════
      // MONTHLY SALES
      // ════════════════════════════════════════════════════════════════════════

      const allMonthlySalesData = await Promise.all(
        Array.from({ length: 12 }, async (_, i) => {
          const m = i + 1;
          const status = getMonthStatus(m);

          //Skip future months for current year to optimize — return empty data
          if (status === "Unavailable") {
            return {
              month: m,
              monthName: fullMonthNames[i],
              status,
              data: { monthlySales: [], topProducts: [] },
            };
          }

          const monthStart = new Date(year, i, 1);
          const monthEnd = new Date(year, i + 1, 0, 23, 59, 59, 999);

          const [
            monthlyOrders,
            monthlyInvoices,
            monthlyIncomes,
            monthlyOrderProducts,
            monthlyInvoiceProducts,
          ] = await Promise.all([
            prisma.order.groupBy({
              by: ["orderDate"],
              where: {
                orderDate: { gte: monthStart, lte: monthEnd },
                status: { in: ["PENDING", "FULFILLED"] },
              },
              _count: { id: true },
              _sum: { total: true },
            }),
            prisma.invoice.groupBy({
              by: ["dateCreated"],
              where: {
                dateCreated: { gte: monthStart, lte: monthEnd },
                status: "PAID",
              },
              _count: { id: true },
              _sum: { amount: true },
            }),
            prisma.income.groupBy({
              by: ["date"],
              where: { date: { gte: monthStart, lte: monthEnd } },
              _sum: { amount: true },
            }),
            prisma.orderProduct.groupBy({
              by: ["productId"],
              where: {
                order: {
                  orderDate: { gte: monthStart, lte: monthEnd },
                  status: { in: ["PENDING", "FULFILLED"] },
                },
              },
              _sum: { quantity: true },
              _count: { productId: true },
            }),
            prisma.invoiceProducts.findMany({
              where: {
                invoice: {
                  dateCreated: { gte: monthStart, lte: monthEnd },
                  status: "PAID",
                },
              },
              include: { Product: true },
            }),
          ]);

          const toWeek = (d: Date) =>
            Math.ceil((d.getDate() + 6 - d.getDay()) / 7);
          const weeklyMap = new Map<
            number,
            { week: number; sales: number; orders: number }
          >();

          monthlyOrders.forEach((item) => {
            const week = toWeek(
              item.orderDate ? new Date(item.orderDate) : new Date(),
            );
            const e = weeklyMap.get(week) ?? { week, sales: 0, orders: 0 };
            e.sales += item._sum?.total ?? 0;
            e.orders += item._count?.id ?? 0;
            weeklyMap.set(week, e);
          });
          monthlyInvoices.forEach((item) => {
            const week = toWeek(new Date(item.dateCreated));
            const e = weeklyMap.get(week) ?? { week, sales: 0, orders: 0 };
            e.sales += item._sum?.amount ?? 0;
            e.orders += item._count?.id ?? 0;
            weeklyMap.set(week, e);
          });
          monthlyIncomes.forEach((item) => {
            const week = toWeek(new Date(item.date));
            const e = weeklyMap.get(week) ?? { week, sales: 0, orders: 0 };
            e.sales += item._sum?.amount ?? 0;
            weeklyMap.set(week, e);
          });

          const monthlySales = Array.from(weeklyMap.values())
            .sort((a, b) => a.week - b.week)
            .map((item) => ({
              week: `Week ${item.week}`,
              sales: Number(item.sales.toFixed(2)),
              orders: item.orders,
              averageOrderValue:
                item.orders > 0
                  ? Number((item.sales / item.orders).toFixed(2))
                  : 0,
            }));

          const productMap = new Map<
            string,
            { unitsSold: number; sales: number }
          >();
          monthlyOrderProducts.forEach((item) => {
            productMap.set(item.productId, {
              unitsSold: (item._sum?.quantity ?? 0) as number,
              sales: item._count?.productId ?? 0,
            });
          });
          monthlyInvoiceProducts.forEach((item) => {
            item.Product.forEach((product) => {
              const e = productMap.get(product.id) ?? {
                unitsSold: 0,
                sales: 0,
              };
              e.unitsSold += item.quantity;
              e.sales += 1;
              productMap.set(product.id, e);
            });
          });

          const productDetails = await prisma.product.findMany({
            where: { id: { in: Array.from(productMap.keys()) } },
            select: { id: true, name: true, price: true },
          });

          const topProducts = productDetails
            .map((p) => {
              const d = productMap.get(p.id) ?? { unitsSold: 0, sales: 0 };
              return {
                name: p.name,
                sales: d.sales,
                revenue: Number((d.unitsSold * p.price).toFixed(2)),
                unitsSold: d.unitsSold,
              };
            })
            .sort((a, b) => b.unitsSold - a.unitsSold)
            .slice(0, 5);

          return {
            month: m,
            monthName: fullMonthNames[i],
            status,
            data: { monthlySales, topProducts },
          };
        }),
      );
      // ════════════════════════════════════════════════════════════════════════
      // QUARTERLY FINANCIALS
      // ════════════════════════════════════════════════════════════════════════

      const [qOrders, qInvoices, qIncome, qExpenses] = await Promise.all([
        prisma.order.groupBy({
          by: ["orderDate"],
          where: {
            orderDate: { gte: yearStart, lte: yearEnd },
            status: { in: ["PENDING", "FULFILLED"] },
          },
          _sum: { total: true, tax: true },
        }),

        prisma.invoice.findMany({
          where: {
            dateCreated: { gte: yearStart, lte: yearEnd },
            status: "PAID",
          },
          select: { dateCreated: true, amount: true, taxRate: true },
        }),

        prisma.income.groupBy({
          by: ["date"],
          where: { date: { gte: yearStart, lte: yearEnd } },
          _sum: { amount: true },
        }),

        prisma.expense.groupBy({
          by: ["date", "category"],
          where: { date: { gte: yearStart, lte: yearEnd } },
          _sum: { amount: true },
        }),
      ]);

      // Monthly accumulators for quarterly financials
      const qMonthlyData: {
        [m: number]: {
          month: number;
          revenue: number;
          expenses: number;
          profit: number;
        };
      } = {};
      const qExpenseByMonth: { [m: number]: { [cat: string]: number } } = {};

      for (let m = 1; m <= 12; m++) {
        qMonthlyData[m] = { month: m, revenue: 0, expenses: 0, profit: 0 };
        qExpenseByMonth[m] = {};
      }

      qOrders.forEach((order) => {
        const m =
          (order.orderDate
            ? new Date(order.orderDate)
            : new Date()
          ).getMonth() + 1;
        qMonthlyData[m].revenue += Number(order._sum.total) || 0;
        qMonthlyData[m].expenses += Number(order._sum.tax) || 0;
      });

      qInvoices.forEach((invoice) => {
        const m = new Date(invoice.dateCreated).getMonth() + 1;
        const amount = Number(invoice.amount);
        const tax = (amount * invoice.taxRate) / 100;
        qMonthlyData[m].revenue += amount;
        qMonthlyData[m].expenses += tax;
        qExpenseByMonth[m]["Tax"] = (qExpenseByMonth[m]["Tax"] || 0) + tax;
      });

      qIncome.forEach((inc) => {
        const m = new Date(inc.date).getMonth() + 1;
        qMonthlyData[m].revenue += Number(inc._sum.amount) || 0;
      });

      qExpenses.forEach((expense) => {
        const m = new Date(expense.date).getMonth() + 1;
        const amount = Number(expense._sum.amount) || 0;
        qMonthlyData[m].expenses += amount;
        qExpenseByMonth[m][expense.category] =
          (qExpenseByMonth[m][expense.category] || 0) + amount;
      });

      Object.values(qMonthlyData).forEach((d) => {
        d.profit = d.revenue - d.expenses;
      });

      const quarterlyFinancialsData = {
        monthlyData: [1, 2, 3, 4].map((q) => ({
          quarter: q,
          monthlyData: Object.values(qMonthlyData)
            .filter((d) => Math.ceil(d.month / 3) === q)
            .map((d) => ({
              month: d.month,
              revenue: Number(d.revenue.toFixed(2)),
              expenses: Number(d.expenses.toFixed(2)),
              profit: Number(d.profit.toFixed(2)),
            })),
        })),
        expenseBreakdown: [1, 2, 3, 4].map((q) => ({
          quarter: q,
          data: Object.entries(
            Object.entries(qExpenseByMonth)
              .filter(([m]) => Math.ceil(parseInt(m) / 3) === q)
              .reduce(
                (acc, [, monthExpenses]) => {
                  Object.entries(monthExpenses).forEach(([cat, amt]) => {
                    acc[cat] = (acc[cat] || 0) + amt;
                  });
                  return acc;
                },
                {} as { [cat: string]: number },
              ),
          ).map(([category, amount]) => ({
            category,
            amount: Number(amount.toFixed(2)),
          })),
        })),
      };

      // ════════════════════════════════════════════════════════════════════════
      // ANNUAL PERFORMANCE
      // ════════════════════════════════════════════════════════════════════════

      const [
        revenueData,
        annualOrders,
        annualInvoices,
        annualIncome,
        customerSatisfaction,
        previousYearRevenue,
      ] = await Promise.all([
        prisma.revenue.findFirst({
          where: { year },
          select: {
            monthlyProjections: {
              select: { month: true, projection: true, actual: true },
            },
          },
        }),

        prisma.order.groupBy({
          by: ["orderDate"],
          where: {
            orderDate: { gte: yearStart, lt: yearEnd },
            status: { in: ["PENDING", "FULFILLED"] },
          },
          _sum: { total: true },
          _count: { id: true },
        }),

        prisma.invoice.groupBy({
          by: ["dateCreated"],
          where: {
            dateCreated: { gte: yearStart, lt: yearEnd },
            status: "PAID",
          },
          _sum: { amount: true },
          _count: { id: true },
        }),

        prisma.income.groupBy({
          by: ["date"],
          where: { date: { gte: yearStart, lte: yearEnd } },
          _sum: { amount: true },
          _count: { id: true },
        }),

        prisma.review.groupBy({
          by: ["orderProductId"],
          _avg: { rating: true },
        }),

        year > 1
          ? prisma.revenue.findFirst({
              where: { year: year - 1 },
              select: {
                monthlyProjections: { select: { actual: true } },
              },
            })
          : Promise.resolve(null),
      ]);

      type QuarterlyPerf = {
        quarter: number;
        sales: number;
        target: number;
        customerSatisfaction: number;
      };

      type QuarterlyPerformanceProp = {
        quarter: string;
        sales: number;
        target: number;
        customerSatisfaction: number;
      };

      const annualQuarterlyData: { [q: number]: QuarterlyPerformanceProp } = {
        1: { quarter: "Q1", sales: 0, target: 0, customerSatisfaction: 0 },
        2: { quarter: "Q2", sales: 0, target: 0, customerSatisfaction: 0 },
        3: { quarter: "Q3", sales: 0, target: 0, customerSatisfaction: 0 },
        4: { quarter: "Q4", sales: 0, target: 0, customerSatisfaction: 0 },
      };

      (revenueData?.monthlyProjections ?? []).forEach((projection) => {
        const monthIdx = new Date(
          Date.parse(projection.month + " 1, 2000"),
        ).getMonth();
        const q = Math.floor(monthIdx / 3) + 1;
        annualQuarterlyData[q].target += projection.projection || 0;
      });

      annualOrders.forEach((order) => {
        if (order.orderDate) {
          const q = Math.floor(new Date(order.orderDate).getMonth() / 3) + 1;
          annualQuarterlyData[q].sales += order._sum?.total ?? 0;
        }
      });

      annualInvoices.forEach((invoice) => {
        const q = Math.floor(new Date(invoice.dateCreated).getMonth() / 3) + 1;
        annualQuarterlyData[q].sales += invoice._sum?.amount ?? 0;
      });

      annualIncome.forEach((inc) => {
        const q = Math.floor(new Date(inc.date).getMonth() / 3) + 1;
        annualQuarterlyData[q].sales += inc._sum?.amount ?? 0;
      });

      let totalSatisfaction = 0;
      let satisfactionCount = 0;
      customerSatisfaction.forEach((cs) => {
        if (cs._avg.rating) {
          totalSatisfaction += cs._avg.rating;
          satisfactionCount++;
        }
      });
      const avgSatisfaction =
        satisfactionCount > 0 ? totalSatisfaction / satisfactionCount : 0;

      Object.values(annualQuarterlyData).forEach((q) => {
        q.customerSatisfaction = avgSatisfaction;
      });

      const quarterlyPerformance = Object.values(annualQuarterlyData);
      const totalAnnualSales = quarterlyPerformance.reduce(
        (s, q) => s + q.sales,
        0,
      );
      const totalTarget = quarterlyPerformance.reduce(
        (s, q) => s + q.target,
        0,
      );

      const previousYearTotalSales =
        previousYearRevenue?.monthlyProjections.reduce(
          (s, m) => s + m.actual,
          0,
        ) ?? 0;

      const yearOverYearGrowth = previousYearTotalSales
        ? ((totalAnnualSales - previousYearTotalSales) /
            previousYearTotalSales) *
          100
        : 0;

      const annualPerformanceData = {
        quarterlyPerformance,
        keyMetrics: [
          {
            metric: "Total Annual Sales",
            value: `$${totalAnnualSales.toFixed(2)}`,
          },
          {
            metric: "Year-over-Year Growth",
            value: `${yearOverYearGrowth.toFixed(2)}%`,
          },
          {
            metric: "Average Customer Satisfaction",
            value: `${avgSatisfaction.toFixed(2)}/5`,
          },
          { metric: "Total Orders", value: totalTarget.toString() },
        ],
      };

      // ════════════════════════════════════════════════════════════════════════
      // ASSEMBLE REPORT DATA — matches ReportData[] shape exactly
      // ════════════════════════════════════════════════════════════════════════

      return [
        {
          type: "Monthly Sales Report" as const,
          items: allMonthlySalesData
            .filter((m) => m.status !== "Unavailable")
            .map((m) => ({
              date: `${shortMonthNames[m.month - 1]} ${year}`,
              status: m.status,
              monthlySalesReport: m.data,
            })),
        },
        {
          type: "Quarterly Financials Report" as const,
          items: [
            {
              date: `${year}`,
              status: getAnnualStatus(),
              quarterlyReport: quarterlyFinancialsData,
            },
          ],
        },
        {
          type: "Annual Performance Report" as const,
          items: [
            {
              date: year.toString(),
              status: getAnnualStatus(),
              annualPerformance: annualPerformanceData,
            },
          ],
        },
      ];
    }),
});
