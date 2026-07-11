import {
  adminSettingsProcedures,
  calculateMonthlyRevenue,
} from "@/features/admin/server/procedures";
import { createCallerFactory } from "@/trpc/init";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockTrpcContext } from "../../helpers/trpc";
import prisma from "@/lib/prisma/client";

// 1. Setup the mocks exactly as configured earlier
vi.mock("@/lib/prisma/client", () => ({
  default: {
    order: {
      findMany: vi.fn(),
    },
    invoice: {
      findMany: vi.fn(),
    },
    income: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    expense: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    revenue: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    companySettings: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

function mockFindMany<T extends (...args: any) => any>(
  fn: T,
  data: Partial<Awaited<ReturnType<T>>[number]>[],
) {
  vi.mocked(fn).mockResolvedValue(data as Awaited<ReturnType<T>>);
}

const createCaller = createCallerFactory(adminSettingsProcedures);

describe("Admin Settings Endpoints", () => {
  let caller: ReturnType<typeof createCaller>;
  beforeEach(() => {
    vi.clearAllMocks();
    caller = createCaller(mockTrpcContext());
  });

  // Helper function - calculateMonthlyRevenue
  describe("Monthly Revenue Calculation Function", () => {
    beforeEach(() => {
      mockFindMany(prisma.order.findMany, []);
      mockFindMany(prisma.invoice.findMany, []);
      mockFindMany(prisma.income.findMany, []);
    });
    // ── A. Happy Path ───────────────────────────────
    it("should sum revenue across orders, invoices and incomes", async () => {
      // Arrange - Define mock database return values
      mockFindMany(prisma.order.findMany, [{ total: 100 }, { total: 250 }]);
      mockFindMany(prisma.invoice.findMany, [{ amount: 150 }]);
      mockFindMany(prisma.income.findMany, [{ amount: 500 }, { amount: 200 }]);

      const result = await calculateMonthlyRevenue(2026, 7);
      expect(result).toBe(1200); // 350 (orders) + 150 (invoice) + 700 (income)
    });

    it("should sum revenue when only orders have data", async () => {
      // Arrange - Define mock database return values
      mockFindMany(prisma.order.findMany, [{ total: 100 }, { total: 250 }]);
      mockFindMany(prisma.invoice.findMany, []);
      mockFindMany(prisma.income.findMany, []);

      const result = await calculateMonthlyRevenue(2026, 7);
      expect(result).toBe(350); // 350 (orders)
    });

    it("should sum revenue when only invoice have data", async () => {
      // Arrange - Define mock database return values
      mockFindMany(prisma.order.findMany, []);
      mockFindMany(prisma.invoice.findMany, [{ amount: 50 }, { amount: 350 }]);
      mockFindMany(prisma.income.findMany, []);

      const result = await calculateMonthlyRevenue(2026, 7);
      expect(result).toBe(400); // 400 (invoices)
    });

    it("should sum revenue when only income have data", async () => {
      // Arrange - Define mock database return values
      mockFindMany(prisma.order.findMany, []);
      mockFindMany(prisma.invoice.findMany, []);
      mockFindMany(prisma.income.findMany, [{ amount: 500 }]);

      const result = await calculateMonthlyRevenue(2026, 7);
      expect(result).toBe(500); // 500 (incomes)
    });

    // ── B. Empty / Zero ───────────────────────────────
    it("should return 0 when all sources are empty", async () => {
      mockFindMany(prisma.order.findMany, []);
      mockFindMany(prisma.invoice.findMany, []);
      mockFindMany(prisma.income.findMany, []);

      const result = await calculateMonthlyRevenue(2026, 7);

      expect(result).toBe(0);
    });

    it("should return 0 when entries exist but all amounts are 0", async () => {
      mockFindMany(prisma.order.findMany, [{ total: 0 }]);
      mockFindMany(prisma.invoice.findMany, [{ amount: 0 }]);
      mockFindMany(prisma.income.findMany, [{ amount: 0 }]);

      const result = await calculateMonthlyRevenue(2026, 7);

      expect(result).toBe(0);
    });

    // ── C. Date boundary correctness ───────────────────────────────
    it("should query with correct start/end ISO bounds for a normal month", async () => {
      mockFindMany(prisma.order.findMany, []);
      mockFindMany(prisma.invoice.findMany, []);
      mockFindMany(prisma.income.findMany, []);

      await calculateMonthlyRevenue(2026, 7);

      const expectedStart = new Date(Date.UTC(2026, 6, 1)).toISOString();
      const expectedEnd = new Date(
        Date.UTC(2026, 7, 0, 23, 59, 59, 999),
      ).toISOString();

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orderDate: { gte: expectedStart, lte: expectedEnd },
          }),
        }),
      );
    });

    it.each([
      { label: "leap year February", year: 2028, month: 2, lastDay: 29 },
      { label: "non-leap year February", year: 2026, month: 2, lastDay: 28 },
      { label: "30-day month (April)", year: 2026, month: 4, lastDay: 30 },
      { label: "31-day month (May)", year: 2026, month: 5, lastDay: 31 },
    ])(
      "should correctly resolves end-of-month for $label",
      async ({ year, month, lastDay }) => {
        mockFindMany(prisma.order.findMany, []);
        mockFindMany(prisma.invoice.findMany, []);
        mockFindMany(prisma.income.findMany, []);

        await calculateMonthlyRevenue(year, month);

        const expectedEnd = new Date(
          Date.UTC(year, month, 0, 23, 59, 59, 999),
        ).toISOString();

        expect(
          expectedEnd.startsWith(
            `${year}-${String(month).padStart(2, "0")}-${lastDay}`,
          ),
        ).toBe(true);

        expect(prisma.income.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              date: expect.objectContaining({ lte: expectedEnd }),
            }),
          }),
        );
      },
    );

    it("should not roll December's end date into the next year", async () => {
      mockFindMany(prisma.order.findMany, []);
      mockFindMany(prisma.invoice.findMany, []);
      mockFindMany(prisma.income.findMany, []);

      await calculateMonthlyRevenue(2026, 12);

      const expectedEnd = new Date(
        Date.UTC(2026, 12, 0, 23, 59, 59, 999),
      ).toISOString();

      expect(expectedEnd.startsWith("2026-12-31")).toBe(true);
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orderDate: expect.objectContaining({ lte: expectedEnd }),
          }),
        }),
      );
    });

    it("should not underflow January's start date into the previous year", async () => {
      mockFindMany(prisma.order.findMany, []);
      mockFindMany(prisma.invoice.findMany, []);
      mockFindMany(prisma.income.findMany, []);

      await calculateMonthlyRevenue(2026, 1);

      const expectedStart = new Date(Date.UTC(2026, 0, 1)).toISOString();

      expect(expectedStart.startsWith("2026-01-01")).toBe(true);
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orderDate: expect.objectContaining({ gte: expectedStart }),
          }),
        }),
      );
    });

    // ── D. Query / filter correctness ───────────────────────────────
    it("should filter orders to PENDING and FULFILLED only", async () => {
      await calculateMonthlyRevenue(2026, 7);

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ["PENDING", "FULFILLED"] },
          }),
        }),
      );
    });

    it("should filter invoices to PAID only", async () => {
      await calculateMonthlyRevenue(2026, 7);

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: "PAID" }),
        }),
      );
    });

    it("should selects only the needed fields from each model", async () => {
      await calculateMonthlyRevenue(2026, 7);

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ select: { total: true } }),
      );
      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ select: { amount: true } }),
      );
      expect(prisma.income.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ select: { amount: true } }),
      );
    });

    it("should call each findMany exactly once per invocation", async () => {
      await calculateMonthlyRevenue(2026, 7);

      expect(prisma.order.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.invoice.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.income.findMany).toHaveBeenCalledTimes(1);
    });

    // ── E. Negative / Invalid ───────────────────────────────
    it("should roll month=0 into December of the previous year (native Date behavior)", async () => {
      await calculateMonthlyRevenue(2026, 0);

      const expectedStart = new Date(Date.UTC(2025, 11, 1)).toISOString();
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orderDate: expect.objectContaining({ gte: expectedStart }),
          }),
        }),
      );
    });

    it("should roll month=13 into January of the next year (native Date behavior)", async () => {
      await calculateMonthlyRevenue(2025, 13);

      const expectedStart = new Date(Date.UTC(2026, 0, 1)).toISOString();
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orderDate: expect.objectContaining({ gte: expectedStart }),
          }),
        }),
      );
    });

    it("should handle negative month by rolling backward without throwing", async () => {
      await expect(calculateMonthlyRevenue(2026, -1)).resolves.toBeTypeOf(
        "number",
      );
    });

    it("should handle year=0 without throwing", async () => {
      await expect(calculateMonthlyRevenue(0, 7)).resolves.toBeTypeOf("number");
    });

    it("should handle negative year without throwing", async () => {
      await expect(calculateMonthlyRevenue(-1, 7)).resolves.toBeTypeOf(
        "number",
      );
    });

    it("should reject when year or month is NaN, since toISOString() throws on an Invalid Date", async () => {
      await expect(calculateMonthlyRevenue(2026, NaN)).rejects.toThrow();
      await expect(calculateMonthlyRevenue(NaN, 7)).rejects.toThrow();
    });

    it("should reject when year or month is Infinity", async () => {
      await expect(calculateMonthlyRevenue(2026, Infinity)).rejects.toThrow();
      await expect(calculateMonthlyRevenue(Infinity, 7)).rejects.toThrow();
    });

    it("should truncate a non-integer month via native Date coercion instead of throwing", async () => {
      // new Date(Date.UTC(y, 6.7, 1)) truncates to month index 6 (July)
      await expect(calculateMonthlyRevenue(2026, 7.7)).resolves.toBeTypeOf(
        "number",
      );
    });

    // ── F. Numeric data edge cases ───────────────────────────────
    it("should correctly sums negative amounts (refunds/credits)", async () => {
      mockFindMany(prisma.order.findMany, [{ total: -50 }, { total: 200 }]);
      mockFindMany(prisma.invoice.findMany, []);
      mockFindMany(prisma.income.findMany, []);

      const result = await calculateMonthlyRevenue(2026, 7);

      expect(result).toBe(150);
    });

    it("should handle floating point amounts within expected precision", async () => {
      mockFindMany(prisma.order.findMany, [{ total: 0.1 }, { total: 0.2 }]);
      mockFindMany(prisma.invoice.findMany, []);
      mockFindMany(prisma.income.findMany, []);

      const result = await calculateMonthlyRevenue(2026, 7);

      expect(result).toBeCloseTo(0.3, 10);
    });

    it("should sum very large numbers without overflow", async () => {
      const big = Number.MAX_SAFE_INTEGER - 10;
      mockFindMany(prisma.order.findMany, [{ total: big }]);
      mockFindMany(prisma.invoice.findMany, [{ amount: 5 }]);
      mockFindMany(prisma.income.findMany, [{ amount: 5 }]);

      const result = await calculateMonthlyRevenue(2026, 7);

      expect(result).toBe(big + 10);
    });

    it("should propagate NaN if a source record has a NaN amount", async () => {
      mockFindMany(prisma.order.findMany, [{ total: NaN }]);
      mockFindMany(prisma.invoice.findMany, [{ amount: 100 }]);
      mockFindMany(prisma.income.findMany, []);

      const result = await calculateMonthlyRevenue(2026, 7);

      expect(result).toBeNaN();
    });

    // ── G. Rejection / error propagation ───────────────────────────────
    it("should reject if prisma.order.findMany rejects", async () => {
      vi.mocked(prisma.order.findMany).mockRejectedValue(new Error("DB down"));
      mockFindMany(prisma.invoice.findMany, []);
      mockFindMany(prisma.income.findMany, []);

      await expect(calculateMonthlyRevenue(2026, 7)).rejects.toThrow("DB down");
    });

    it("should reject if prisma.invoice.findMany rejects", async () => {
      mockFindMany(prisma.order.findMany, []);
      vi.mocked(prisma.invoice.findMany).mockRejectedValue(
        new Error("DB down"),
      );
      mockFindMany(prisma.income.findMany, []);

      await expect(calculateMonthlyRevenue(2026, 7)).rejects.toThrow("DB down");
    });

    it("should reject if prisma.income.findMany rejects", async () => {
      mockFindMany(prisma.order.findMany, []);
      mockFindMany(prisma.invoice.findMany, []);
      vi.mocked(prisma.income.findMany).mockRejectedValue(new Error("DB down"));

      await expect(calculateMonthlyRevenue(2026, 7)).rejects.toThrow("DB down");
    });
  });

  describe("Income Procedure Tests", () => {
    it("should get all income without filters", async () => {
      mockFindMany(prisma.income.findMany, []);
    });
    it("should get all income with all filters", async () => {});
    it("should get all income with date filters", async () => {});
    it("should get all income with category filters", async () => {});
    it("should get all income with amount filters", async () => {});
  });
});
