import { dashboardProcedures } from "@/features/admin/dashboard/server/procedures";
import prisma from "@/lib/prisma/client";
import { OrderStatus } from "@/lib/utils";
import { createCallerFactory } from "@/trpc/init";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockTrpcContext } from "../../helpers/trpc";
import { faker } from "@faker-js/faker";
import { Decimal } from "@/generated/prisma/internal/prismaNamespace";

vi.mock("@/lib/prisma/client", () => ({
  default: {
    order: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
      aggregate: vi.fn(),
    },
    invoice: {
      groupBy: vi.fn(),
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
    income: {
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    monthlyProjection: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      aggregate: vi.fn(),
    },
    orderProduct: {
      groupBy: vi.fn(),
    },
    invoiceProducts: {
      findMany: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    },
    revenue: {
      findFirst: vi.fn(),
    },
    expense: {
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    review: {
      groupBy: vi.fn(),
    },
  },
}));

type OrderFindManyResult = Array<{
  id: string;
  orderNumber: string | null;
  orderDate: Date | null;
  total: number;
  status: OrderStatus;
  shippingInfo: { firstName: string; lastName: string };
}>;

type OrderGroupByResult = Array<{
  status: OrderStatus;
  _count: { status: number };
}>;

type InvoiceGroupByResult = Array<{
  status: string;
  _count: { status: number };
}>;

interface MockOverviewDataOptions {
  orders?: OrderFindManyResult;
  orderGroupBy?: OrderGroupByResult;
  orderAggregate?: { _sum: { total: number | null } };
  invoiceGroupBy?: InvoiceGroupByResult;
  invoiceAggregate?: { _sum: { amountPaid: number | null } };
  incomeAggregate?: { _sum: { amount: number | null } };
}
interface RecentOrdersOptions {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

interface MockPerformanceDataOptions {
  monthlyProjections?: { month: string; actual: Decimal }[];
  orderProducts?: { productId: string; _sum: { quantity: number | null } }[];
  invoiceProducts?: {
    quantity: number;
    Product: { id: string; name: string }[];
  }[];
  products?: { id: string; name: string }[];
}

interface MockAnalyticsDataOptions {
  // prisma.revenue.findFirst — can be null if no revenue target set
  projectedRevenue?: { yearlyTarget: number } | null;

  // prisma.monthlyProjection.findFirst (actual only) — null if month not found
  totalMonthlyRevenue?: { actual: number } | null;

  // prisma.monthlyProjection.findFirst (projection + actual) — null if month not found
  monthlyRevenue?: { projection: number; actual: number } | null;

  // prisma.monthlyProjection.aggregate — always returns object, _sum fields can be null
  totalActualRevenue?: { _sum: { actual: number | null } };

  // prisma.expense.aggregate — always returns object, _sum fields can be null
  totalMonthlyExpense?: { _sum: { amount: number | null } };

  // prisma.income.groupBy — always an array, empty if no records
  incomeData?: { category: string; _sum: { amount: number | null } }[];

  // prisma.expense.groupBy — always an array, empty if no records
  expenseData?: { category: string; _sum: { amount: number | null } }[];
}

interface MockReportDataOptions {
  // Monthly sales — per-month arrays, called 12 times (once per month)
  monthlyOrders?: {
    orderDate: Date | null;
    _count: { id: number };
    _sum: { total: number | null };
  }[];
  monthlyInvoices?: {
    dateCreated: Date | string;
    _count: { id: number };
    _sum: { amount: number | null };
  }[];
  monthlyIncomes?: {
    date: Date;
    _sum: { amount: number | null };
  }[];
  monthlyOrderProducts?: {
    productId: string;
    _sum: { quantity: number | null };
    _count: { productId: number };
  }[];
  monthlyInvoiceProducts?: {
    quantity: number;
    Product: { id: string; name: string; price: number }[];
  }[];
  monthlyProducts?: { id: string; name: string; price: number }[];

  // Quarterly financials
  qOrders?: {
    orderDate: Date | null;
    _sum: { total: number | null; tax: number | null };
  }[];
  qInvoices?: {
    dateCreated: string;
    amount: number;
    taxRate: number;
  }[];
  qIncome?: {
    date: Date;
    _sum: { amount: number | null };
  }[];
  qExpenses?: {
    date: Date;
    category: string;
    _sum: { amount: number | null };
  }[];

  // Annual performance
  revenueData?: {
    monthlyProjections: {
      month: string;
      projection: number;
      actual: number;
    }[];
  } | null;
  annualOrders?: {
    orderDate: Date | null;
    _sum: { total: number | null };
    _count: { id: number };
  }[];
  annualInvoices?: {
    dateCreated: string;
    _sum: { amount: number | null };
    _count: { id: number };
  }[];
  annualIncome?: {
    date: Date;
    _sum: { amount: number | null };
    _count: { id: number };
  }[];
  customerSatisfaction?: {
    orderProductId: string;
    _avg: { rating: number | null };
  }[];
  previousYearRevenue?: {
    monthlyProjections: { actual: number }[];
  } | null;
}

const createCaller = createCallerFactory(dashboardProcedures);

describe("Dashboard Endpoints Tests", () => {
  let caller: ReturnType<typeof createCaller>;
  beforeEach(() => {
    vi.clearAllMocks();
    caller = createCaller(mockTrpcContext());
  });

  describe("OverView Tab Tests", () => {
    const makeOrder = (
      index: number,
      status: OrderStatus = "PENDING",
      orderNumber: string | null = `ORD-${String(index).padStart(3, "0")}`,
    ) => {
      return {
        id: `order-${index}`,
        orderNumber,
        orderDate: faker.date.recent({ days: 30 }),
        total: faker.number.int({
          min: 50,
          max: 5000,
        }),
        status,
        shippingInfo: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
        },
      };
    };

    const statuses: OrderStatus[] = [
      "PENDING",
      "CANCELLED",
      "UNVERIFIED",
      "SHIPPED",
      "DELIVERED",
      "FULFILLED",
      "CANCELLATION_REQUESTED",
    ];

    const rawRecentOrdersData = Array.from({ length: 20 }, (_, i) =>
      makeOrder(i + 1, faker.helpers.arrayElement(statuses)),
    );

    const recentOrdersData = ({
      startDate,
      endDate,
      limit = 5,
    }: RecentOrdersOptions) => {
      const today = new Date();
      const monthAgo = new Date(today);
      monthAgo.setDate(today.getDate() - 30);

      if (startDate == null) startDate = monthAgo;
      if (endDate == null) endDate = today;

      return rawRecentOrdersData // ← add `return`
        .filter((order) => {
          if (order.orderDate == null) return false;
          if (order.orderDate < startDate!) return false;
          if (order.orderDate > endDate!) return false;
          return true;
        })
        .sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime())
        .slice(0, limit);
    };

    const mockOverviewData = ({
      orders = [],
      orderGroupBy = [],
      orderAggregate = { _sum: { total: null } },
      invoiceGroupBy = [],
      invoiceAggregate = { _sum: { amountPaid: null } },
      incomeAggregate = { _sum: { amount: null } },
    }: MockOverviewDataOptions = {}) => {
      vi.mocked(prisma.order.findMany).mockResolvedValue(orders as never);
      vi.mocked(prisma.order.groupBy).mockResolvedValue(orderGroupBy as never);
      vi.mocked(prisma.order.aggregate).mockResolvedValue(
        orderAggregate as never,
      );
      vi.mocked(prisma.invoice.groupBy).mockResolvedValue(
        invoiceGroupBy as never,
      );
      vi.mocked(prisma.invoice.aggregate).mockResolvedValue(
        invoiceAggregate as never,
      );
      vi.mocked(prisma.income.aggregate).mockResolvedValue(
        incomeAggregate as never,
      );
    };
    // Test case for fetching overview data with no startDate, endDate or limit props
    it("fetches overview data with no filters", async () => {
      const recentOrders = recentOrdersData({});
      mockOverviewData({
        orders: recentOrders,
        orderGroupBy: [
          { status: "PENDING", _count: { status: 3 } },
          { status: "UNVERIFIED", _count: { status: 1 } },
          { status: "CANCELLED", _count: { status: 2 } },
        ],
        orderAggregate: { _sum: { total: 7800 } },
        invoiceGroupBy: [
          { status: "PAID", _count: { status: 4 } },
          { status: "UNPAID", _count: { status: 2 } },
          { status: "DUE", _count: { status: 5 } },
        ],
        invoiceAggregate: { _sum: { amountPaid: 5000 } },
        incomeAggregate: { _sum: { amount: 12000 } },
      });

      const result = await caller.overviewData({});

      expect(result.totalRevenue).toBe(24800); // 7800 + 5000 + 12000
      expect(result.totalOrders).toBe(6); // 3 + 1 + 2
      expect(result.pendingOrders).toBe(3);
      expect(result.unVerifiedOrders).toBe(1);
      expect(result.totalInvoices).toBe(11); // 4 + 2 + 5
      expect(result.unpaidInvoices).toBe(2);
      expect(result.dueInvoices).toBe(5);
      expect(result.recentOrders.length).toBe(5);
      result.recentOrders.forEach((order) => {
        const orderDate = new Date(order.orderDate).getTime();
        const assertionStartDate = new Date();
        assertionStartDate.setDate(assertionStartDate.getDate() - 30);
        const assertionEndDate = new Date();
        expect(orderDate).toBeGreaterThanOrEqual(assertionStartDate.getTime());
        expect(orderDate).toBeLessThanOrEqual(assertionEndDate.getTime());
      });
    });
    // Test case for fetching overview data with no startDate or limit props but with endDate prop
    it("fetches overview data with only endDate filter", async () => {
      const endDate = new Date("2026-05-22");
      mockOverviewData({
        orders: recentOrdersData({ endDate }),
        orderGroupBy: [
          { status: "PENDING", _count: { status: 6 } },
          { status: "UNVERIFIED", _count: { status: 0 } },
          { status: "CANCELLED", _count: { status: 1 } },
        ],
        orderAggregate: { _sum: { total: 6500 } },
        invoiceGroupBy: [
          { status: "PAID", _count: { status: 2 } },
          { status: "UNPAID", _count: { status: 2 } },
          { status: "DUE", _count: { status: 2 } },
        ],
        invoiceAggregate: { _sum: { amountPaid: 5000 } },
        incomeAggregate: { _sum: { amount: 500 } },
      });

      const result = await caller.overviewData({});

      expect(result.totalRevenue).toBe(12000); // 6500 + 5000 + 500
      expect(result.totalOrders).toBe(7); // 6 + 0 + 1
      expect(result.pendingOrders).toBe(6);
      expect(result.unVerifiedOrders).toBe(0);
      expect(result.totalInvoices).toBe(6); // 2 + 2 + 2
      expect(result.unpaidInvoices).toBe(2);
      expect(result.dueInvoices).toBe(2);
      expect(result.recentOrders.length).toBe(5);
      result.recentOrders.forEach((order) => {
        const orderDate = new Date(order.orderDate).getTime();

        const assertionStartDate = new Date();
        assertionStartDate.setDate(assertionStartDate.getDate() - 30);

        expect(orderDate).toBeGreaterThanOrEqual(assertionStartDate.getTime());
        expect(orderDate).toBeLessThanOrEqual(endDate.getTime());
      });
    });
    // Test case for fetching overview data with no endDate or limit props but with startDate prop
    it("fetches overview data with only startDate filter", async () => {
      const startDate = new Date("2026-05-22");
      mockOverviewData({
        orders: recentOrdersData({ startDate }),
        orderGroupBy: [
          { status: "PENDING", _count: { status: 6 } },
          { status: "UNVERIFIED", _count: { status: 0 } },
          { status: "CANCELLED", _count: { status: 1 } },
        ],
        orderAggregate: { _sum: { total: 6500 } },
        invoiceGroupBy: [
          { status: "PAID", _count: { status: 2 } },
          { status: "UNPAID", _count: { status: 2 } },
          { status: "DUE", _count: { status: 2 } },
        ],
        invoiceAggregate: { _sum: { amountPaid: 5000 } },
        incomeAggregate: { _sum: { amount: 500 } },
      });

      const result = await caller.overviewData({});

      expect(result.totalRevenue).toBe(12000); // 6500 + 5000 + 500
      expect(result.totalOrders).toBe(7); // 6 + 0 + 1
      expect(result.pendingOrders).toBe(6);
      expect(result.unVerifiedOrders).toBe(0);
      expect(result.totalInvoices).toBe(6); // 2 + 2 + 2
      expect(result.unpaidInvoices).toBe(2);
      expect(result.dueInvoices).toBe(2);
      expect(result.recentOrders.length).toBe(5);
      result.recentOrders.forEach((order) => {
        const orderDate = new Date(order.orderDate).getTime();

        const assertionStartDate = new Date(startDate);
        const assertionEndDate = new Date();

        expect(orderDate).toBeGreaterThanOrEqual(assertionStartDate.getTime());
        expect(orderDate).toBeLessThanOrEqual(assertionEndDate.getTime());
      });
    });
    // Test case for fetching overview data with no startDate or endDate props but with limit prop
    it("fetches overview data with only limit filter", async () => {
      const limit = 8;
      mockOverviewData({
        orders: recentOrdersData({ limit }),
        orderGroupBy: [
          { status: "PENDING", _count: { status: 6 } },
          { status: "UNVERIFIED", _count: { status: 0 } },
          { status: "CANCELLED", _count: { status: 1 } },
        ],
        orderAggregate: { _sum: { total: 6500 } },
        invoiceGroupBy: [
          { status: "PAID", _count: { status: 2 } },
          { status: "UNPAID", _count: { status: 2 } },
          { status: "DUE", _count: { status: 2 } },
        ],
        invoiceAggregate: { _sum: { amountPaid: 5000 } },
        incomeAggregate: { _sum: { amount: 500 } },
      });

      const result = await caller.overviewData({});

      expect(result.totalRevenue).toBe(12000); // 6500 + 5000 + 500
      expect(result.totalOrders).toBe(7); // 6 + 0 + 1
      expect(result.pendingOrders).toBe(6);
      expect(result.unVerifiedOrders).toBe(0);
      expect(result.totalInvoices).toBe(6); // 2 + 2 + 2
      expect(result.unpaidInvoices).toBe(2);
      expect(result.dueInvoices).toBe(2);
      expect(result.recentOrders.length).toBe(limit);
      result.recentOrders.forEach((order) => {
        const orderDate = new Date(order.orderDate).getTime();

        const assertionStartDate = new Date();
        assertionStartDate.setDate(assertionStartDate.getDate() - 30);
        const assertionEndDate = new Date();

        expect(orderDate).toBeGreaterThanOrEqual(assertionStartDate.getTime());
        expect(orderDate).toBeLessThanOrEqual(assertionEndDate.getTime());
      });
    });
    // Test case for fetching overview data with all props provided
    it("fetches overview data with all filters", async () => {
      const startDate = new Date("2026-05-22");
      const endDate = new Date("2026-06-22");
      const limit = 3;
      mockOverviewData({
        orders: recentOrdersData({ startDate, endDate, limit }),
        orderGroupBy: [
          { status: "PENDING", _count: { status: 3 } },
          { status: "UNVERIFIED", _count: { status: 1 } },
          { status: "CANCELLED", _count: { status: 2 } },
        ],
        orderAggregate: { _sum: { total: 7800 } },
        invoiceGroupBy: [
          { status: "PAID", _count: { status: 4 } },
          { status: "UNPAID", _count: { status: 2 } },
          { status: "DUE", _count: { status: 5 } },
        ],
        invoiceAggregate: { _sum: { amountPaid: 5000 } },
        incomeAggregate: { _sum: { amount: 12000 } },
      });

      const result = await caller.overviewData({});

      expect(result.totalRevenue).toBe(24800); // 7800 + 5000 + 12000
      expect(result.totalOrders).toBe(6); // 3 + 1 + 2
      expect(result.pendingOrders).toBe(3);
      expect(result.unVerifiedOrders).toBe(1);
      expect(result.totalInvoices).toBe(11); // 4 + 2 + 5
      expect(result.unpaidInvoices).toBe(2);
      expect(result.dueInvoices).toBe(5);
      expect(result.recentOrders.length).toBe(limit);
      result.recentOrders.forEach((order) => {
        const orderDate = new Date(order.orderDate).getTime();

        const assertionStartDate = new Date(startDate);
        const assertionEndDate = new Date(endDate);

        expect(orderDate).toBeGreaterThanOrEqual(assertionStartDate.getTime());
        expect(orderDate).toBeLessThanOrEqual(assertionEndDate.getTime());
      });
    });

    // Gap 1 — zero revenue when all aggregates are null
    it("returns 0 totalRevenue when all aggregates are null", async () => {
      mockOverviewData({
        orders: [],
        orderAggregate: { _sum: { total: null } },
        invoiceAggregate: { _sum: { amountPaid: null } },
        incomeAggregate: { _sum: { amount: null } },
      });

      const result = await caller.overviewData({});

      expect(result.totalRevenue).toBe(0);
    });

    // Gap 2 — recentOrders shape
    it("transforms recentOrders to the correct shape", async () => {
      const order = makeOrder(1, "PENDING");
      mockOverviewData({ orders: [order] });

      const result = await caller.overviewData({});

      expect(result.recentOrders[0]).toEqual({
        customer: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
        order: order.orderNumber,
        orderDate: order.orderDate!.toISOString(),
        total: order.total,
      });
    });

    // Gap 3 — orderNumber null fallback
    it("falls back to order id when orderNumber is null", async () => {
      const order = makeOrder(1, "PENDING", null); // orderNumber = null
      mockOverviewData({ orders: [order] });

      const result = await caller.overviewData({});

      // procedure does: order.orderNumber ?? order.id
      expect(result.recentOrders[0].order).toBe(order.id);
    });

    // Test case to confirm unauthenticated users cannot access the overview data
    it("throws UNAUTHORIZED when not authenticated", async () => {
      const unauthCaller = createCaller(mockTrpcContext(null));
      await expect(unauthCaller.overviewData({})).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });
  });

  describe("Performance Tab Tests", () => {
    const makeMonthlyProjection = (month: string, actual: number) => ({
      month,
      actual: new Decimal(actual),
    });

    const makeOrderProduct = (
      index: number,
      quantity: number | null = null,
    ) => ({
      productId: `prod-${index}`,
      _sum: {
        quantity: quantity ?? faker.number.int({ min: 1, max: 50 }),
      },
    });

    const makeInvoiceProduct = (
      index: number,
      quantity: number | null = null,
    ) => ({
      quantity: quantity ?? faker.number.int({ min: 1, max: 20 }),
      Product: [
        { id: `prod-${index + 10}`, name: faker.commerce.productName() },
      ],
    });

    const makeProduct = (index: number) => ({
      id: `prod-${index + 20}`,
      name: faker.commerce.productName(),
    });

    // ─── Raw Data Pools ───────────────────────────────────────────────────────────

    const months = [
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

    const rawMonthlyProjections = months.map((month) =>
      makeMonthlyProjection(month, faker.number.int({ min: 500, max: 5000 })),
    );

    const rawOrderProducts = Array.from({ length: 10 }, (_, i) =>
      makeOrderProduct(i + 1),
    );

    const rawInvoiceProducts = Array.from({ length: 10 }, (_, i) =>
      makeInvoiceProduct(i + 1),
    );

    const rawMissingProducts = Array.from({ length: 5 }, (_, i) => ({
      id: `prod-${i + 1}`, // same IDs as rawOrderProducts to trigger the fetch
      name: faker.commerce.productName(),
    }));

    const mockPerformanceData = ({
      monthlyProjections = rawMonthlyProjections,
      orderProducts = rawOrderProducts,
      invoiceProducts = rawInvoiceProducts,
      products = [],
    }: MockPerformanceDataOptions = {}) => {
      vi.mocked(prisma.monthlyProjection.findMany).mockResolvedValue(
        monthlyProjections as never,
      );
      vi.mocked(prisma.orderProduct.groupBy).mockResolvedValue(
        orderProducts as never,
      );
      vi.mocked(prisma.invoiceProducts.findMany).mockResolvedValue(
        invoiceProducts as never,
      );
      vi.mocked(prisma.product.findMany).mockResolvedValue(products as never);
    };

    describe("year filter", () => {
      it("uses current year when no year input is provided", async () => {
        mockPerformanceData();
        const currentYear = new Date().getFullYear();

        await caller.performanceMetricsData({});

        expect(prisma.monthlyProjection.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { revenue: { year: currentYear } },
          }),
        );

        expect(prisma.orderProduct.groupBy).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              order: expect.objectContaining({
                orderDate: {
                  gte: new Date(currentYear, 0, 1).toISOString(),
                  lte: new Date(
                    currentYear,
                    11,
                    31,
                    23,
                    59,
                    59,
                    999,
                  ).toISOString(),
                },
              }),
            }),
          }),
        );

        expect(prisma.invoiceProducts.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              invoice: expect.objectContaining({
                dateCreated: {
                  gte: new Date(currentYear, 0, 1).toISOString(),
                  lte: new Date(
                    currentYear,
                    11,
                    31,
                    23,
                    59,
                    59,
                    999,
                  ).toISOString(),
                },
              }),
            }),
          }),
        );
      });

      it("uses the provided year when year input is given", async () => {
        mockPerformanceData();
        const year = 2024;

        await caller.performanceMetricsData({ year });

        expect(prisma.monthlyProjection.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { revenue: { year: 2024 } },
          }),
        );

        expect(prisma.orderProduct.groupBy).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              order: expect.objectContaining({
                orderDate: {
                  gte: new Date(2024, 0, 1).toISOString(),
                  lte: new Date(2024, 11, 31, 23, 59, 59, 999).toISOString(),
                },
              }),
            }),
          }),
        );

        expect(prisma.invoiceProducts.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              invoice: expect.objectContaining({
                dateCreated: {
                  gte: new Date(2024, 0, 1).toISOString(),
                  lte: new Date(2024, 11, 31, 23, 59, 59, 999).toISOString(),
                },
              }),
            }),
          }),
        );
      });

      it("uses different data for different years", async () => {
        const year2024Projections = months.map((month) =>
          makeMonthlyProjection(month, 1000),
        );
        const year2025Projections = months.map((month) =>
          makeMonthlyProjection(month, 2000),
        );

        // test 2024
        mockPerformanceData({ monthlyProjections: year2024Projections });
        const result2024 = await caller.performanceMetricsData({ year: 2024 });
        expect(result2024.revenueGrowthData[0].revenue).toBe(1000);

        // test 2025
        mockPerformanceData({ monthlyProjections: year2025Projections });
        const result2025 = await caller.performanceMetricsData({ year: 2025 });
        expect(result2025.revenueGrowthData[0].revenue).toBe(2000);
      });
    });

    describe("revenue growth data", () => {
      it("returns revenue growth data for all 12 months", async () => {
        mockPerformanceData();
        const result = await caller.performanceMetricsData({});
        expect(result.revenueGrowthData).toHaveLength(12);
      });

      it("returns months in calendar order regardless of input order", async () => {
        // deliberately out of order
        mockPerformanceData({
          monthlyProjections: [
            makeMonthlyProjection("December", 1200),
            makeMonthlyProjection("March", 900),
            makeMonthlyProjection("July", 1500),
            makeMonthlyProjection("January", 800),
          ],
        });

        const result = await caller.performanceMetricsData({});

        expect(result.revenueGrowthData.map((d) => d.month)).toEqual([
          "January",
          "March",
          "July",
          "December",
        ]);
      });

      it("rounds revenue to 1 decimal place", async () => {
        mockPerformanceData({
          monthlyProjections: [
            makeMonthlyProjection("January", 1500.456),
            makeMonthlyProjection("February", 2200.999),
          ],
        });

        const result = await caller.performanceMetricsData({});

        expect(result.revenueGrowthData[0].revenue).toBe(1500.5);
        expect(result.revenueGrowthData[1].revenue).toBe(2201.0);
      });

      it("returns empty revenue growth data when no projections exist", async () => {
        mockPerformanceData({ monthlyProjections: [] });

        const result = await caller.performanceMetricsData({});

        expect(result.revenueGrowthData).toEqual([]);
      });

      it("returns correct shape for each revenue growth entry", async () => {
        mockPerformanceData({
          monthlyProjections: [makeMonthlyProjection("June", 3000)],
        });

        const result = await caller.performanceMetricsData({});

        expect(result.revenueGrowthData[0]).toEqual({
          month: "June",
          revenue: 3000.0,
        });
      });
    });

    describe("product performance data", () => {
      it("returns at most 5 products", async () => {
        // 10 order products + 10 invoice products = 20 unique products
        mockPerformanceData();

        const result = await caller.performanceMetricsData({});

        expect(result.productPerformanceData.length).toBeLessThanOrEqual(5);
      });

      it("returns products sorted by quantity descending", async () => {
        mockPerformanceData({
          orderProducts: [
            makeOrderProduct(1, 10),
            makeOrderProduct(2, 50),
            makeOrderProduct(3, 30),
          ],
          invoiceProducts: [], // no invoices so no name merging needed
          products: [
            { id: "prod-1", name: "Product A" },
            { id: "prod-2", name: "Product B" },
            { id: "prod-3", name: "Product C" },
          ],
        });

        const result = await caller.performanceMetricsData({});

        expect(result.productPerformanceData[0].value).toBe(50); // prod-2
        expect(result.productPerformanceData[1].value).toBe(30); // prod-3
        expect(result.productPerformanceData[2].value).toBe(10); // prod-1
      });

      it("merges quantities from both orders and invoices for the same product", async () => {
        mockPerformanceData({
          orderProducts: [{ productId: "prod-1", _sum: { quantity: 10 } }],
          invoiceProducts: [
            {
              quantity: 5,
              Product: [{ id: "prod-1", name: "Jollof Rice" }], // same prod-1
            },
          ],
          products: [],
        });

        const result = await caller.performanceMetricsData({});

        const jollofRice = result.productPerformanceData.find(
          (p) => p.name === "Jollof Rice",
        );
        expect(jollofRice?.value).toBe(15); // 10 + 5
      });

      it("handles null order quantity using 0 as fallback", async () => {
        mockPerformanceData({
          orderProducts: [{ productId: "prod-1", _sum: { quantity: null } }],
          invoiceProducts: [],
          products: [{ id: "prod-1", name: "Pounded Yam" }],
        });

        const result = await caller.performanceMetricsData({});

        const poundedYam = result.productPerformanceData.find(
          (p) => p.name === "Pounded Yam",
        );
        expect(poundedYam?.value).toBe(0);
      });

      it("returns correct shape for each product performance entry", async () => {
        mockPerformanceData({
          orderProducts: [{ productId: "prod-1", _sum: { quantity: 20 } }],
          invoiceProducts: [],
          products: [{ id: "prod-1", name: "Egusi Soup" }],
        });

        const result = await caller.performanceMetricsData({});

        expect(result.productPerformanceData[0]).toEqual({
          name: "Egusi Soup",
          value: 20,
        });
      });
    });

    describe("missing product name fallback", () => {
      it("fetches product names from prisma when missing from invoices", async () => {
        mockPerformanceData({
          orderProducts: [
            { productId: "prod-1", _sum: { quantity: 10 } },
            { productId: "prod-2", _sum: { quantity: 5 } },
          ],
          invoiceProducts: [], // no invoice products so no names available
          products: [
            { id: "prod-1", name: "Jollof Rice" },
            { id: "prod-2", name: "Egusi Soup" },
          ],
        });

        await caller.performanceMetricsData({});

        expect(prisma.product.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: { in: expect.arrayContaining(["prod-1", "prod-2"]) } },
          }),
        );
      });

      // Gap 4 — rawMissingProducts pool is now exercised
      it("uses rawMissingProducts pool to resolve names for order-only products", async () => {
        mockPerformanceData({
          orderProducts: rawMissingProducts.map((p) => ({
            productId: p.id,
            _sum: { quantity: 5 },
          })),
          invoiceProducts: [], // no invoice names — triggers fallback fetch
          products: rawMissingProducts,
        });

        const result = await caller.performanceMetricsData({});

        // All names should resolve from the fallback fetch
        result.productPerformanceData.forEach((entry) => {
          const match = rawMissingProducts.find((p) => p.name === entry.name);
          expect(match).toBeDefined();
        });
      });

      it("uses product ID as name fallback when product is not found", async () => {
        mockPerformanceData({
          orderProducts: [{ productId: "prod-999", _sum: { quantity: 10 } }],
          invoiceProducts: [],
          products: [], // product.findMany returns nothing
        });

        const result = await caller.performanceMetricsData({});

        // procedure falls back to the id itself: productNames.get(id) ?? id
        expect(result.productPerformanceData[0].name).toBe("prod-999");
      });

      it("does not call prisma.product.findMany when all names come from invoices", async () => {
        mockPerformanceData({
          orderProducts: [],
          invoiceProducts: [
            {
              quantity: 5,
              Product: [{ id: "prod-11", name: "Fried Plantain" }],
            },
          ],
          products: [],
        });

        await caller.performanceMetricsData({});

        // all names resolved from invoices so no fallback fetch needed
        expect(prisma.product.findMany).not.toHaveBeenCalled();
      });
    });

    describe("empty data", () => {
      it("returns empty arrays when there are no orders, invoices or projections", async () => {
        mockPerformanceData({
          monthlyProjections: [],
          orderProducts: [],
          invoiceProducts: [],
        });

        const result = await caller.performanceMetricsData({});

        expect(result.productPerformanceData).toEqual([]);
        expect(result.revenueGrowthData).toEqual([]);
      });
    });

    describe("unauthenticated error handling", () => {
      it("throws UNAUTHORIZED when not authenticated", async () => {
        const unauthCaller = createCaller(mockTrpcContext(null));
        await expect(
          unauthCaller.performanceMetricsData({}),
        ).rejects.toMatchObject({
          code: "UNAUTHORIZED",
        });
      });
    });
  });

  describe("Analytics Tab Tests", () => {
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

    const mockAnalyticsData = ({
      projectedRevenue = { yearlyTarget: 0 },
      totalMonthlyRevenue = { actual: 0 },
      monthlyRevenue = { projection: 0, actual: 0 },
      totalActualRevenue = { _sum: { actual: null } },
      totalMonthlyExpense = { _sum: { amount: null } },
      incomeData = [],
      expenseData = [],
    }: MockAnalyticsDataOptions = {}) => {
      vi.mocked(prisma.revenue.findFirst).mockResolvedValue(
        projectedRevenue as never,
      );
      vi.mocked(prisma.monthlyProjection.findFirst)
        .mockResolvedValueOnce(totalMonthlyRevenue as never) // first call — actual only
        .mockResolvedValueOnce(monthlyRevenue as never); // second call — projection + actual
      vi.mocked(prisma.monthlyProjection.aggregate).mockResolvedValue(
        totalActualRevenue as never,
      );
      vi.mocked(prisma.expense.aggregate).mockResolvedValue(
        totalMonthlyExpense as never,
      );
      vi.mocked(prisma.income.groupBy).mockResolvedValue(incomeData as never);
      vi.mocked(prisma.expense.groupBy).mockResolvedValue(expenseData as never);
    };

    describe("year and month filters", () => {
      it("uses current year and month when no input is provided", async () => {
        mockAnalyticsData();
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const expectedStartDate = new Date(currentYear, currentMonth - 1, 1);
        const expectedEndDate = new Date(
          currentYear,
          currentMonth,
          0,
          23,
          59,
          59,
          999,
        );

        await caller.analyticsChartData({});

        expect(prisma.revenue.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({ where: { year: currentYear } }),
        );
        expect(prisma.monthlyProjection.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              month: monthNames[currentMonth - 1],
              revenue: { year: currentYear },
            },
          }),
        );
        expect(prisma.expense.aggregate).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              date: { gte: expectedStartDate, lte: expectedEndDate },
            },
          }),
        );
      });

      it("uses provided year and month when both are given", async () => {
        mockAnalyticsData();
        const year = 2024;
        const month = 6;
        const expectedStartDate = new Date(2024, 5, 1);
        const expectedEndDate = new Date(2024, 6, 0, 23, 59, 59, 999);

        await caller.analyticsChartData({ year, month });

        expect(prisma.revenue.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({ where: { year: 2024 } }),
        );
        expect(prisma.monthlyProjection.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              month: "June",
              revenue: { year: 2024 },
            },
          }),
        );
        expect(prisma.expense.aggregate).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              date: { gte: expectedStartDate, lte: expectedEndDate },
            },
          }),
        );
      });

      it("uses provided year with current month when only year is given", async () => {
        mockAnalyticsData();
        const currentMonth = new Date().getMonth() + 1;

        await caller.analyticsChartData({ year: 2023 });

        expect(prisma.revenue.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({ where: { year: 2023 } }),
        );
        expect(prisma.monthlyProjection.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              month: monthNames[currentMonth - 1],
              revenue: { year: 2023 },
            },
          }),
        );
      });

      it("uses current year with provided month when only month is given", async () => {
        mockAnalyticsData();
        const currentYear = new Date().getFullYear();

        await caller.analyticsChartData({ month: 3 });

        expect(prisma.revenue.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({ where: { year: currentYear } }),
        );
        expect(prisma.monthlyProjection.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              month: "March",
              revenue: { year: currentYear },
            },
          }),
        );
      });

      it("scopes expense and income queries to the correct month date range", async () => {
        mockAnalyticsData();
        const expectedStartDate = new Date(2025, 0, 1); // Jan 1
        const expectedEndDate = new Date(2025, 1, 0, 23, 59, 59, 999); // Jan 31

        await caller.analyticsChartData({ year: 2025, month: 1 });

        expect(prisma.income.groupBy).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              date: { gte: expectedStartDate, lte: expectedEndDate },
            },
          }),
        );
        expect(prisma.expense.groupBy).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              date: { gte: expectedStartDate, lte: expectedEndDate },
            },
          }),
        );
      });

      it("scopes yearly aggregate to the full year regardless of month", async () => {
        mockAnalyticsData();

        await caller.analyticsChartData({ year: 2025, month: 6 });

        // aggregate should use year filter, not month date range
        expect(prisma.monthlyProjection.aggregate).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { revenue: { year: 2025 } },
          }),
        );
      });

      it("rejects month below 1", async () => {
        await expect(
          caller.analyticsChartData({ month: 0 }),
        ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      });

      it("rejects month above 12", async () => {
        await expect(
          caller.analyticsChartData({ month: 13 }),
        ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      });
    });

    // ─── Yearly Revenue Data ──────────────────────────────────────────────────────

    describe("yearlyRevenueData", () => {
      it("returns correct projected and actual yearly revenue", async () => {
        mockAnalyticsData({
          projectedRevenue: { yearlyTarget: 100000 },
          totalActualRevenue: { _sum: { actual: 75000 } },
        });

        const result = await caller.analyticsChartData({});

        expect(result.yearlyRevenueData).toEqual({
          projected: 100000,
          actual: 75000,
        });
      });

      it("falls back to 0 when projectedRevenue is null", async () => {
        mockAnalyticsData({
          projectedRevenue: null,
          totalActualRevenue: { _sum: { actual: 50000 } },
        });

        const result = await caller.analyticsChartData({});

        expect(result.yearlyRevenueData.projected).toBe(0);
      });

      it("falls back to 0 when totalActualRevenue._sum.actual is null", async () => {
        mockAnalyticsData({
          projectedRevenue: { yearlyTarget: 100000 },
          totalActualRevenue: { _sum: { actual: null } },
        });

        const result = await caller.analyticsChartData({});

        expect(result.yearlyRevenueData.actual).toBe(0);
      });
    });

    // ─── Monthly Revenue Data ─────────────────────────────────────────────────────

    describe("monthlyRevenueData", () => {
      it("returns correct projected and actual monthly revenue", async () => {
        mockAnalyticsData({
          monthlyRevenue: { projection: 8000, actual: 6500 },
        });

        const result = await caller.analyticsChartData({});

        expect(result.monthlyRevenueData).toEqual({
          projected: 8000,
          actual: 6500,
        });
      });

      it("falls back to 0 when monthlyRevenue is null", async () => {
        mockAnalyticsData({ monthlyRevenue: null });

        const result = await caller.analyticsChartData({});

        expect(result.monthlyRevenueData).toEqual({ projected: 0, actual: 0 });
      });
    });

    // ─── Profit Data ──────────────────────────────────────────────────────────────

    describe("profitData", () => {
      it("returns correct profit when revenue exceeds expenses", async () => {
        mockAnalyticsData({
          totalMonthlyRevenue: { actual: 10000 },
          totalMonthlyExpense: { _sum: { amount: 3000 } },
        });

        const result = await caller.analyticsChartData({});

        expect(result.profitData).toEqual({
          totalRevenue: 10000,
          profit: 7000, // 10000 - 3000
        });
      });

      it("clamps profit to 0 when expenses exceed revenue", async () => {
        mockAnalyticsData({
          totalMonthlyRevenue: { actual: 2000 },
          totalMonthlyExpense: { _sum: { amount: 5000 } },
        });

        const result = await caller.analyticsChartData({});

        // rawProfit = -3000, clamped to 0
        expect(result.profitData).toEqual({
          totalRevenue: 2000,
          profit: 0,
        });
      });

      it("returns 0 profit when both revenue and expenses are null", async () => {
        mockAnalyticsData({
          totalMonthlyRevenue: null,
          totalMonthlyExpense: { _sum: { amount: null } },
        });

        const result = await caller.analyticsChartData({});

        expect(result.profitData).toEqual({ totalRevenue: 0, profit: 0 });
      });
    });

    // ─── Income and Expense Category Data ────────────────────────────────────────

    describe("incomeData and expenseData", () => {
      it("transforms income groupBy results to category/value shape", async () => {
        mockAnalyticsData({
          incomeData: [
            { category: "Sales", _sum: { amount: 5000 } },
            { category: "Catering", _sum: { amount: 2000 } },
          ],
        });

        const result = await caller.analyticsChartData({});

        expect(result.incomeData).toEqual([
          { category: "Sales", value: 5000 },
          { category: "Catering", value: 2000 },
        ]);
      });

      it("transforms expense groupBy results to category/value shape", async () => {
        mockAnalyticsData({
          expenseData: [
            { category: "Supplies", _sum: { amount: 1500 } },
            { category: "Utilities", _sum: { amount: 800 } },
          ],
        });

        const result = await caller.analyticsChartData({});

        expect(result.expenseData).toEqual([
          { category: "Supplies", value: 1500 },
          { category: "Utilities", value: 800 },
        ]);
      });

      it("falls back to 0 when a category amount is null", async () => {
        mockAnalyticsData({
          incomeData: [{ category: "Sales", _sum: { amount: null } }],
          expenseData: [{ category: "Supplies", _sum: { amount: null } }],
        });

        const result = await caller.analyticsChartData({});

        expect(result.incomeData[0].value).toBe(0);
        expect(result.expenseData[0].value).toBe(0);
      });

      it("returns empty arrays when there are no income or expense records", async () => {
        mockAnalyticsData({ incomeData: [], expenseData: [] });

        const result = await caller.analyticsChartData({});

        expect(result.incomeData).toEqual([]);
        expect(result.expenseData).toEqual([]);
      });
    });

    // ─── Return Shape ─────────────────────────────────────────────────────────────

    describe("return shape", () => {
      it("returns all expected top level keys", async () => {
        mockAnalyticsData();

        const result = await caller.analyticsChartData({});

        expect(result).toHaveProperty("yearlyRevenueData");
        expect(result).toHaveProperty("monthlyRevenueData");
        expect(result).toHaveProperty("profitData");
        expect(result).toHaveProperty("incomeData");
        expect(result).toHaveProperty("expenseData");
      });
    });

    describe("unauthenticated error handling", () => {
      it("throws UNAUTHORIZED when not authenticated", async () => {
        const unauthCaller = createCaller(mockTrpcContext(null));
        await expect(unauthCaller.analyticsChartData({})).rejects.toMatchObject(
          {
            code: "UNAUTHORIZED",
          },
        );
      });
    });
  });

  describe("Reports Tab Tests", () => {
    // ─── Factories ──────────────────────────────────────────────────────────────

    const makeMonthlyOrder = (date: Date, total: number) => ({
      orderDate: date,
      _count: { id: 1 },
      _sum: { total, tax: 0 },
    });

    const makeMonthlyInvoice = (
      dateCreated: Date | string,
      amount: number,
    ) => ({
      dateCreated,
      _count: { id: 1 },
      _sum: { amount },
    });

    const makeMonthlyIncome = (date: Date, amount: number) => ({
      date,
      _sum: { amount },
    });

    const makeQExpense = (date: Date, category: string, amount: number) => ({
      date,
      category,
      _sum: { amount },
    });

    const makeAnnualOrder = (date: Date, total: number) => ({
      orderDate: date,
      _sum: { total },
      _count: { id: 1 },
    });

    const makeAnnualInvoice = (dateCreated: string, amount: number) => ({
      dateCreated,
      _sum: { amount },
      _count: { id: 1 },
    });

    // ─── Mock Setter ─────────────────────────────────────────────────────────────

    const mockReportData = ({
      monthlyOrders = [],
      monthlyInvoices = [],
      monthlyIncomes = [],
      monthlyOrderProducts = [],
      monthlyInvoiceProducts = [],
      monthlyProducts = [],
      qInvoices = [],
      qExpenses = [],
      revenueData = { monthlyProjections: [] },
      customerSatisfaction = [],
      previousYearRevenue = null,
    }: MockReportDataOptions = {}) => {
      // order.groupBy — shared across monthly, quarterly, and annual calls
      vi.mocked(prisma.order.groupBy).mockResolvedValue(monthlyOrders as never);
      // invoice.groupBy — shared across monthly and annual calls
      vi.mocked(prisma.invoice.groupBy).mockResolvedValue(
        monthlyInvoices as never,
      );
      // income.groupBy — shared across monthly, quarterly, and annual calls
      vi.mocked(prisma.income.groupBy).mockResolvedValue(
        monthlyIncomes as never,
      );
      vi.mocked(prisma.orderProduct.groupBy).mockResolvedValue(
        monthlyOrderProducts as never,
      );
      vi.mocked(prisma.invoiceProducts.findMany).mockResolvedValue(
        monthlyInvoiceProducts as never,
      );
      vi.mocked(prisma.product.findMany).mockResolvedValue(
        monthlyProducts as never,
      );
      // Quarterly — invoice.findMany used only for quarterly financials
      vi.mocked(prisma.invoice.findMany).mockResolvedValue(qInvoices as never);
      // Quarterly — expense.groupBy
      vi.mocked(prisma.expense.groupBy).mockResolvedValue(qExpenses as never);
      // Annual — revenue.findFirst called twice: current year then previous year
      vi.mocked(prisma.revenue.findFirst)
        .mockResolvedValueOnce(revenueData as never)
        .mockResolvedValueOnce(previousYearRevenue as never);
      // Annual — review.groupBy for customer satisfaction
      vi.mocked(prisma.review.groupBy).mockResolvedValue(
        customerSatisfaction as never,
      );
    };

    // ─── Return Shape ─────────────────────────────────────────────────────────────

    describe("return shape", () => {
      it("returns an array of 3 report types", async () => {
        mockReportData();
        const result = await caller.reportData({});
        expect(result).toHaveLength(3);
      });

      it("returns reports with correct type labels", async () => {
        mockReportData();
        const result = await caller.reportData({});
        expect(result[0].type).toBe("Monthly Sales Report");
        expect(result[1].type).toBe("Quarterly Financials Report");
        expect(result[2].type).toBe("Annual Performance Report");
      });

      it("each report has a type and items array", async () => {
        mockReportData();
        const result = await caller.reportData({});
        result.forEach((report) => {
          expect(report).toHaveProperty("type");
          expect(report).toHaveProperty("items");
          expect(Array.isArray(report.items)).toBe(true);
        });
      });
    });

    // ─── Year Filter ──────────────────────────────────────────────────────────────

    describe("year filter", () => {
      it("uses current year when no year input is provided", async () => {
        mockReportData();
        const currentYear = new Date().getFullYear();

        await caller.reportData({});

        expect(prisma.revenue.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { year: currentYear },
          }),
        );
      });

      it("uses provided year when year is given", async () => {
        mockReportData();

        await caller.reportData({ year: 2024 });

        expect(prisma.revenue.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { year: 2024 },
          }),
        );
      });

      it("fetches previous year revenue for year-over-year growth", async () => {
        mockReportData();

        await caller.reportData({ year: 2025 });

        // second revenue.findFirst call should be for 2024
        expect(prisma.revenue.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { year: 2024 },
          }),
        );
      });
    });

    // ─── Monthly Sales Report ────────────────────────────────────────────────────

    describe("Monthly Sales Report", () => {
      it("filters out Unavailable months from monthly sales items", async () => {
        mockReportData();

        // Use a past year so all months are Completed — none filtered out
        const result = await caller.reportData({ year: 2023 });
        const monthlySalesReport = result.find(
          (r) => r.type === "Monthly Sales Report",
        );

        // past year — all 12 months should be included
        expect(monthlySalesReport?.items).toHaveLength(12);
      });

      it("each monthly sales item has date, status and monthlySalesReport", async () => {
        mockReportData();
        const result = await caller.reportData({ year: 2023 });
        const monthlySalesReport = result.find(
          (r) => r.type === "Monthly Sales Report",
        );

        monthlySalesReport?.items.forEach((item) => {
          expect(item).toHaveProperty("date");
          expect(item).toHaveProperty("status");
          expect(item).toHaveProperty("monthlySalesReport");
        });
      });

      it("date is formatted as 'MMM YYYY'", async () => {
        mockReportData();
        const result = await caller.reportData({ year: 2023 });
        const monthlySalesReport = result.find(
          (r) => r.type === "Monthly Sales Report",
        );

        // e.g. "Jan 2023", "Feb 2023"
        monthlySalesReport?.items.forEach((item) => {
          expect(item.date).toMatch(/^[A-Z][a-z]{2} \d{4}$/);
        });
      });

      it("aggregates weekly sales correctly from orders", async () => {
        const jan15 = new Date(2023, 0, 15); // week 3 of January
        mockReportData({
          monthlyOrders: [makeMonthlyOrder(jan15, 500)],
        });

        const result = await caller.reportData({ year: 2023 });
        const monthlySalesReport = result.find(
          (r) => r.type === "Monthly Sales Report",
        );
        const janItem = monthlySalesReport?.items.find((i) =>
          i.date.startsWith("Jan"),
        );

        expect(janItem?.monthlySalesReport.monthlySales.length).toBeGreaterThan(
          0,
        );
        const week3 = janItem?.monthlySalesReport.monthlySales.find(
          (w) => w.week === "Week 3",
        );
        expect(week3?.sales).toBe(500);
      });

      it("aggregates weekly sales from invoices via makeMonthlyInvoice", async () => {
        const jan20 = new Date(2023, 0, 20);
        mockReportData({
          monthlyInvoices: [makeMonthlyInvoice(jan20, 800)],
        });

        const result = await caller.reportData({ year: 2023 });
        const monthlySalesReport = result.find(
          (r) => r.type === "Monthly Sales Report",
        );
        const janItem = monthlySalesReport?.items.find((i) =>
          i.date.startsWith("Jan"),
        );

        expect(janItem?.monthlySalesReport.monthlySales.length).toBeGreaterThan(
          0,
        );
        // Jan 20 falls in week 3
        const week3 = janItem?.monthlySalesReport.monthlySales.find(
          (w) => w.week === "Week 3",
        );
        expect(week3?.sales).toBe(800);
      });

      it("returns top 5 products at most per month", async () => {
        mockReportData({
          monthlyProducts: Array.from({ length: 10 }, (_, i) => ({
            id: `prod-${i}`,
            name: `Product ${i}`,
            price: 100,
          })),
          monthlyOrderProducts: Array.from({ length: 10 }, (_, i) => ({
            productId: `prod-${i}`,
            _sum: { quantity: i + 1 },
            _count: { productId: 1 },
          })),
        });

        const result = await caller.reportData({ year: 2023 });
        const monthlySalesReport = result.find(
          (r) => r.type === "Monthly Sales Report",
        );

        monthlySalesReport?.items.forEach((item) => {
          expect(
            item.monthlySalesReport.topProducts.length,
          ).toBeLessThanOrEqual(5);
        });
      });

      it("marks past months as Completed and current month as In Progress", async () => {
        mockReportData();
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        const result = await caller.reportData({ year: currentYear });
        const monthlySalesReport = result.find(
          (r) => r.type === "Monthly Sales Report",
        );

        // The procedure filters out Unavailable months so only past + current appear
        const completedItems = monthlySalesReport?.items.filter(
          (item) => item.status === "Completed",
        );
        const inProgressItems = monthlySalesReport?.items.filter(
          (item) => item.status === "In Progress",
        );

        // All months before current should be Completed
        expect(completedItems?.length).toBe(currentMonth - 1);
        // Current month should be In Progress
        expect(inProgressItems?.length).toBe(1);
      });

      it("excludes future months for current year", async () => {
        mockReportData();
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        const result = await caller.reportData({ year: currentYear });
        const monthlySalesReport = result.find(
          (r) => r.type === "Monthly Sales Report",
        );

        // Only past + current months included (Unavailable filtered out)
        expect(monthlySalesReport?.items.length).toBe(currentMonth);
      });
    });

    // ─── Quarterly Financials Report ─────────────────────────────────────────────

    describe("Quarterly Financials Report", () => {
      it("quarterly report has exactly 1 item", async () => {
        mockReportData();
        const result = await caller.reportData({ year: 2023 });
        const quarterlyReport = result.find(
          (r) => r.type === "Quarterly Financials Report",
        );
        expect(quarterlyReport?.items).toHaveLength(1);
      });

      it("quarterly report item has date, status and quarterlyReport", async () => {
        mockReportData();
        const result = await caller.reportData({ year: 2023 });
        const quarterlyReport = result.find(
          (r) => r.type === "Quarterly Financials Report",
        );
        expect(quarterlyReport?.items[0]).toHaveProperty("date");
        expect(quarterlyReport?.items[0]).toHaveProperty("status");
        expect(quarterlyReport?.items[0]).toHaveProperty("quarterlyReport");
      });

      it("date is the year as a string", async () => {
        mockReportData();
        const result = await caller.reportData({ year: 2023 });
        const quarterlyReport = result.find(
          (r) => r.type === "Quarterly Financials Report",
        );
        expect(quarterlyReport?.items[0].date).toBe("2023");
      });

      it("quarterlyReport has 4 quarters in monthlyData", async () => {
        mockReportData();
        const result = await caller.reportData({ year: 2023 });
        const quarterlyReport = result.find(
          (r) => r.type === "Quarterly Financials Report",
        );
        expect(
          quarterlyReport?.items[0].quarterlyReport.monthlyData,
        ).toHaveLength(4);
      });

      it("each quarter has 3 months of data", async () => {
        mockReportData();
        const result = await caller.reportData({ year: 2023 });
        const quarterlyReport = result.find(
          (r) => r.type === "Quarterly Financials Report",
        );
        quarterlyReport?.items[0].quarterlyReport.monthlyData.forEach((q) => {
          expect(q.monthlyData).toHaveLength(3);
        });
      });

      it("aggregates order revenue into correct quarter", async () => {
        mockReportData({
          qOrders: [
            makeMonthlyOrder(new Date(2023, 0, 15), 1000), // Jan → Q1
            makeMonthlyOrder(new Date(2023, 5, 15), 2000), // Jun → Q2
          ],
        });

        const result = await caller.reportData({ year: 2023 });
        const quarterlyReport = result.find(
          (r) => r.type === "Quarterly Financials Report",
        );
        const q1 = quarterlyReport?.items[0].quarterlyReport.monthlyData.find(
          (q) => q.quarter === 1,
        );
        const q2 = quarterlyReport?.items[0].quarterlyReport.monthlyData.find(
          (q) => q.quarter === 2,
        );

        const q1Jan = q1?.monthlyData.find((m) => m.month === 1);
        const q2Jun = q2?.monthlyData.find((m) => m.month === 6);
        expect(q1Jan?.revenue).toBe(1000);
        expect(q2Jun?.revenue).toBe(2000);
      });

      it("profit = revenue - expenses per month", async () => {
        mockReportData({
          qOrders: [makeMonthlyOrder(new Date(2023, 0, 15), 5000)],
          qExpenses: [makeQExpense(new Date(2023, 0, 20), "Supplies", 1500)],
        });

        const result = await caller.reportData({ year: 2023 });
        const quarterlyReport = result.find(
          (r) => r.type === "Quarterly Financials Report",
        );
        const q1 = quarterlyReport?.items[0].quarterlyReport.monthlyData.find(
          (q) => q.quarter === 1,
        );
        const jan = q1?.monthlyData.find((m) => m.month === 1);
        expect(jan?.profit).toBe(3500); // 5000 - 1500
      });

      it("expenseBreakdown has 4 quarters", async () => {
        mockReportData();
        const result = await caller.reportData({ year: 2023 });
        const quarterlyReport = result.find(
          (r) => r.type === "Quarterly Financials Report",
        );
        expect(
          quarterlyReport?.items[0].quarterlyReport.expenseBreakdown,
        ).toHaveLength(4);
      });

      it("expenseBreakdown groups expenses by category within each quarter", async () => {
        mockReportData({
          qExpenses: [
            makeQExpense(new Date(2023, 0, 10), "Supplies", 500), // Jan → Q1
            makeQExpense(new Date(2023, 0, 20), "Utilities", 300), // Jan → Q1
            makeQExpense(new Date(2023, 3, 5), "Supplies", 700), // Apr → Q2
          ],
        });

        const result = await caller.reportData({ year: 2023 });
        const quarterlyReport = result.find(
          (r) => r.type === "Quarterly Financials Report",
        );
        const breakdown =
          quarterlyReport?.items[0].quarterlyReport.expenseBreakdown;

        const q1Breakdown = breakdown?.find((b) => b.quarter === 1);
        const q2Breakdown = breakdown?.find((b) => b.quarter === 2);

        const q1Supplies = q1Breakdown?.data.find(
          (d) => d.category === "Supplies",
        );
        const q1Utilities = q1Breakdown?.data.find(
          (d) => d.category === "Utilities",
        );
        const q2Supplies = q2Breakdown?.data.find(
          (d) => d.category === "Supplies",
        );

        expect(q1Supplies?.amount).toBe(500);
        expect(q1Utilities?.amount).toBe(300);
        expect(q2Supplies?.amount).toBe(700);
      });

      it("expenseBreakdown returns empty data array for quarters with no expenses", async () => {
        mockReportData({ qExpenses: [] });
        const result = await caller.reportData({ year: 2023 });
        const quarterlyReport = result.find(
          (r) => r.type === "Quarterly Financials Report",
        );
        const breakdown =
          quarterlyReport?.items[0].quarterlyReport.expenseBreakdown;
        breakdown?.forEach((q) => {
          expect(q.data).toEqual([]);
        });
      });
    });

    // ─── Annual Performance Report ───────────────────────────────────────────────

    describe("Annual Performance Report", () => {
      it("annual report has exactly 1 item", async () => {
        mockReportData();
        const result = await caller.reportData({ year: 2023 });
        const annualReport = result.find(
          (r) => r.type === "Annual Performance Report",
        );
        expect(annualReport?.items).toHaveLength(1);
      });

      it("annual report item has date, status and annualPerformance", async () => {
        mockReportData();
        const result = await caller.reportData({ year: 2023 });
        const annualReport = result.find(
          (r) => r.type === "Annual Performance Report",
        );
        expect(annualReport?.items[0]).toHaveProperty("date");
        expect(annualReport?.items[0]).toHaveProperty("status");
        expect(annualReport?.items[0]).toHaveProperty("annualPerformance");
      });

      it("quarterlyPerformance has 4 entries", async () => {
        mockReportData();
        const result = await caller.reportData({ year: 2023 });
        const annualReport = result.find(
          (r) => r.type === "Annual Performance Report",
        );
        expect(
          annualReport?.items[0].annualPerformance.quarterlyPerformance,
        ).toHaveLength(4);
      });

      it("keyMetrics has 4 entries with correct metric labels", async () => {
        mockReportData();
        const result = await caller.reportData({ year: 2023 });
        const annualReport = result.find(
          (r) => r.type === "Annual Performance Report",
        );
        const metrics = annualReport?.items[0].annualPerformance.keyMetrics.map(
          (m) => m.metric,
        );
        expect(metrics).toEqual([
          "Total Annual Sales",
          "Year-over-Year Growth",
          "Average Customer Satisfaction",
          "Total Orders",
        ]);
      });

      it("calculates year-over-year growth correctly", async () => {
        mockReportData({
          monthlyOrders: [makeAnnualOrder(new Date(2025, 0, 15), 12000)],
          previousYearRevenue: {
            monthlyProjections: [{ actual: 10000 }],
          },
        });

        const result = await caller.reportData({ year: 2025 });
        const annualReport = result.find(
          (r) => r.type === "Annual Performance Report",
        );
        const yoyMetric =
          annualReport?.items[0].annualPerformance.keyMetrics.find(
            (m) => m.metric === "Year-over-Year Growth",
          );

        // totalAnnualSales = 12000 (from orders via shared groupBy mock)
        // previousYearTotal = 10000
        // growth = (12000 - 10000) / 10000 * 100 = 20.00%
        expect(yoyMetric?.value).toBe("20.00%");
      });

      it("returns 0% year-over-year growth when no previous year data", async () => {
        mockReportData({ previousYearRevenue: null });

        const result = await caller.reportData({ year: 2025 });
        const annualReport = result.find(
          (r) => r.type === "Annual Performance Report",
        );
        const yoyMetric =
          annualReport?.items[0].annualPerformance.keyMetrics.find(
            (m) => m.metric === "Year-over-Year Growth",
          );
        expect(yoyMetric?.value).toBe("0.00%");
      });

      // FIX Bug 3 — makeAnnualInvoice now used
      it("includes invoice sales in annual total via makeAnnualInvoice", async () => {
        mockReportData({
          monthlyInvoices: [makeAnnualInvoice("2023-03-15", 5000)],
          previousYearRevenue: null,
        });

        const result = await caller.reportData({ year: 2023 });
        const annualReport = result.find(
          (r) => r.type === "Annual Performance Report",
        );
        const salesMetric =
          annualReport?.items[0].annualPerformance.keyMetrics.find(
            (m) => m.metric === "Total Annual Sales",
          );

        // Invoice amount contributes to totalAnnualSales via shared invoice.groupBy mock
        expect(salesMetric?.value).toBe("$5000.00");
      });

      it("calculates average customer satisfaction correctly", async () => {
        mockReportData({
          customerSatisfaction: [
            { orderProductId: "op-1", _avg: { rating: 4.0 } },
            { orderProductId: "op-2", _avg: { rating: 5.0 } },
          ],
        });

        const result = await caller.reportData({ year: 2023 });
        const annualReport = result.find(
          (r) => r.type === "Annual Performance Report",
        );
        const satisfactionMetric =
          annualReport?.items[0].annualPerformance.keyMetrics.find(
            (m) => m.metric === "Average Customer Satisfaction",
          );

        // (4.0 + 5.0) / 2 = 4.5
        expect(satisfactionMetric?.value).toBe("4.50/5");
      });

      it("returns 0 satisfaction when no reviews exist", async () => {
        mockReportData({ customerSatisfaction: [] });

        const result = await caller.reportData({ year: 2023 });
        const annualReport = result.find(
          (r) => r.type === "Annual Performance Report",
        );
        const satisfactionMetric =
          annualReport?.items[0].annualPerformance.keyMetrics.find(
            (m) => m.metric === "Average Customer Satisfaction",
          );
        expect(satisfactionMetric?.value).toBe("0.00/5");
      });
    });

    // ─── Status Helpers ───────────────────────────────────────────────────────────

    describe("report status helpers", () => {
      it("past year reports are all Completed", async () => {
        mockReportData();
        const result = await caller.reportData({ year: 2020 });

        const quarterly = result.find(
          (r) => r.type === "Quarterly Financials Report",
        );
        const annual = result.find(
          (r) => r.type === "Annual Performance Report",
        );

        expect(quarterly?.items[0].status).toBe("Completed");
        expect(annual?.items[0].status).toBe("Completed");
      });

      it("current year annual report is In Progress (YTD)", async () => {
        mockReportData();
        const currentYear = new Date().getFullYear();
        const result = await caller.reportData({ year: currentYear });

        const annual = result.find(
          (r) => r.type === "Annual Performance Report",
        );
        expect(annual?.items[0].status).toBe("In Progress (YTD)");
      });

      it("future year reports are Unavailable", async () => {
        mockReportData();
        const result = await caller.reportData({ year: 2099 });

        const quarterly = result.find(
          (r) => r.type === "Quarterly Financials Report",
        );
        const annual = result.find(
          (r) => r.type === "Annual Performance Report",
        );

        expect(quarterly?.items[0].status).toBe("Unavailable");
        expect(annual?.items[0].status).toBe("Unavailable");
      });
    });

    // ─── Authentication ──────────────────────────────────────────────────────────
    describe("unauthenticated error handling", () => {
      it("throws UNAUTHORIZED when not authenticated", async () => {
        const unauthCaller = createCaller(mockTrpcContext(null));
        await expect(unauthCaller.reportData({})).rejects.toMatchObject({
          code: "UNAUTHORIZED",
        });
      });
    });
  });
});
