import { beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "@/lib/prisma/client";
import {
  addHours,
  calculateEstimatedDelivery,
  calculateMonthlyRevenue,
  generateInvoiceNumber,
  generateOrderNumber,
} from "@/lib/helper";

// ✅ Single vi.mock covering all prisma models used across all functions
vi.mock("@/lib/prisma/client", () => ({
  default: {
    $transaction: vi.fn(),
    order: { findMany: vi.fn(), findFirst: vi.fn() },
    invoice: { findMany: vi.fn(), findFirst: vi.fn() },
    income: { findMany: vi.fn() },
  },
}));

function mockTransaction(txOverrides: Record<string, unknown> = {}) {
  vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
    return callback({ ...txOverrides } as never);
  });
}

describe("helper functions", () => {
  describe("generateInvoiceNumber", () => {
    beforeEach(() => vi.clearAllMocks());

    it("generates INV-0001 when no invoices exist", async () => {
      vi.mocked(prisma.invoice.findFirst).mockResolvedValue(null);

      const result = await generateInvoiceNumber();

      expect(result).toBe("INV-0001");
    });

    it("increments from the last invoice number", async () => {
      vi.mocked(prisma.invoice.findFirst).mockResolvedValue({
        invoiceNumber: "INV-0005",
      } as never);

      const result = await generateInvoiceNumber();

      expect(result).toBe("INV-0006");
    });

    it("pads the number to 4 digits", async () => {
      vi.mocked(prisma.invoice.findFirst).mockResolvedValue({
        invoiceNumber: "INV-0099",
      } as never);

      const result = await generateInvoiceNumber();

      expect(result).toBe("INV-0100");
    });

    it("handles double digit rollover correctly", async () => {
      vi.mocked(prisma.invoice.findFirst).mockResolvedValue({
        invoiceNumber: "INV-0999",
      } as never);

      const result = await generateInvoiceNumber();

      expect(result).toBe("INV-1000");
    });

    it("falls back to INV-0001 when invoiceNumber format is unexpected", async () => {
      vi.mocked(prisma.invoice.findFirst).mockResolvedValue({
        invoiceNumber: "INVALID",
      } as never);

      const result = await generateInvoiceNumber();

      expect(result).toBe("INV-0001");
    });

    it("queries invoices ordered by invoiceNumber descending", async () => {
      vi.mocked(prisma.invoice.findFirst).mockResolvedValue(null);

      await generateInvoiceNumber();

      expect(prisma.invoice.findFirst).toHaveBeenCalledWith({
        orderBy: { invoiceNumber: "desc" },
        select: { invoiceNumber: true },
      });
    });
  });

  describe("generateOrderNumber", () => {
    beforeEach(() => vi.clearAllMocks());

    it("generates ORD-0001 when no orders exist", async () => {
      mockTransaction({
        order: { findFirst: vi.fn().mockResolvedValue(null) },
      });

      const result = await generateOrderNumber();
      expect(result).toBe("ORD-0001");
    });

    it("increments from the last order number", async () => {
      mockTransaction({
        order: {
          findFirst: vi.fn().mockResolvedValue({ orderNumber: "ORD-0010" }),
        },
      });

      const result = await generateOrderNumber();
      expect(result).toBe("ORD-0011");
    });

    it("pads the number to 4 digits", async () => {
      mockTransaction({
        order: {
          findFirst: vi.fn().mockResolvedValue({ orderNumber: "ORD-0999" }),
        },
      });

      const result = await generateOrderNumber();
      expect(result).toBe("ORD-1000");
    });

    it("falls back to ORD-0001 when orderNumber format is unexpected", async () => {
      mockTransaction({
        order: {
          findFirst: vi.fn().mockResolvedValue({ orderNumber: "INVALID" }),
        },
      });

      const result = await generateOrderNumber();
      expect(result).toBe("ORD-0001");
    });

    // ✅ Added — verifies the startsWith filter is applied
    it("queries only orders with ORD- prefix", async () => {
      mockTransaction({
        order: { findFirst: vi.fn().mockResolvedValue(null) },
      });

      await generateOrderNumber();

      const txMock = vi.mocked(prisma.$transaction).mock
        .calls[0][0] as Function;
      const orderFindFirst = vi.fn().mockResolvedValue(null);
      await txMock({ order: { findFirst: orderFindFirst } });

      expect(orderFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { orderNumber: { startsWith: "ORD-" } },
        }),
      );
    });
  });

  describe("calculateMonthlyRevenue", () => {
    beforeEach(() => vi.clearAllMocks());

    it("sums orders, invoices, and incomes correctly", async () => {
      vi.mocked(prisma.order.findMany).mockResolvedValue([
        { total: 100 },
        { total: 200 },
      ] as never);
      vi.mocked(prisma.invoice.findMany).mockResolvedValue([
        { amount: 300 },
      ] as never);
      vi.mocked(prisma.income.findMany).mockResolvedValue([
        { amount: 400 },
      ] as never);

      const result = await calculateMonthlyRevenue(2025, 1);
      expect(result).toBe(1000); // 300 + 300 + 400
    });

    it("returns 0 when there are no records", async () => {
      vi.mocked(prisma.order.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.invoice.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.income.findMany).mockResolvedValue([] as never);

      const result = await calculateMonthlyRevenue(2025, 1);
      expect(result).toBe(0);
    });

    it("queries orders with PENDING and FULFILLED statuses only", async () => {
      vi.mocked(prisma.order.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.invoice.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.income.findMany).mockResolvedValue([] as never);

      await calculateMonthlyRevenue(2025, 6);

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ["PENDING", "FULFILLED"] },
          }),
        }),
      );
    });

    it("queries invoices with PAID status only", async () => {
      vi.mocked(prisma.order.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.invoice.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.income.findMany).mockResolvedValue([] as never);

      await calculateMonthlyRevenue(2025, 6);

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: "PAID" }),
        }),
      );
    });

    // ✅ Updated date strings to match Date.UTC output in helper.ts
    it("scopes queries to the correct month date range", async () => {
      vi.mocked(prisma.order.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.invoice.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.income.findMany).mockResolvedValue([] as never);

      await calculateMonthlyRevenue(2025, 2);

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orderDate: {
              gte: "2025-02-01T00:00:00.000Z",
              lte: "2025-02-28T23:59:59.999Z",
            },
          }),
        }),
      );
    });

    // ✅ Added — invoice dateCreated now uses full ISO string (not split("T")[0])
    it("scopes invoice queries to the correct month date range", async () => {
      vi.mocked(prisma.order.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.invoice.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.income.findMany).mockResolvedValue([] as never);

      await calculateMonthlyRevenue(2025, 2);

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            dateCreated: {
              gte: "2025-02-01T00:00:00.000Z",
              lte: "2025-02-28T23:59:59.999Z",
            },
          }),
        }),
      );
    });
  });

  describe("addHours Function", () => {
    it("adds hours to a Date object correctly", () => {
      const date = new Date("2025-01-01T00:00:00Z");

      const result = addHours(date, 5);

      expect(result.toISOString()).toBe("2025-01-01T05:00:00.000Z");
    });

    it("adds hours to a date string correctly", () => {
      const dateStr = "2025-03-25T00:00:00Z";

      const result = addHours(dateStr, 48);

      expect(result.toISOString()).toBe("2025-03-27T00:00:00.000Z");
    });

    it("handles negative hours correctly", () => {
      const date = new Date("2025-01-01T00:00:00Z");
      const result = addHours(date, -3);
      expect(result.toISOString()).toBe("2024-12-31T21:00:00.000Z");
    });

    it("handles fractional hours correctly", () => {
      const date = new Date("2025-01-01T00:00:00Z");
      const result = addHours(date, 1.5);
      expect(result.toISOString()).toBe("2025-01-01T01:30:00.000Z");
    });

    it("handles zero hours correctly", () => {
      const date = new Date("2025-01-01T00:00:00Z");
      const result = addHours(date, 0);
      expect(result.toISOString()).toBe("2025-01-01T00:00:00.000Z");
    });

    it("handles large number of hours correctly", () => {
      const date = new Date("2025-01-01T00:00:00Z");
      const result = addHours(date, 1000);
      expect(result.toISOString()).toBe("2025-02-11T16:00:00.000Z");
    });

    it("does not mutate the original Date object", () => {
      const date = new Date("2025-01-01T00:00:00Z");
      const originalISOString = date.toISOString();
      addHours(date, 5);
      expect(date.toISOString()).toBe(originalISOString);
    });

    it("handles leap year date correctly", () => {
      const date = new Date("2024-02-28T23:00:00Z");
      const result = addHours(date, 2);
      expect(result.toISOString()).toBe("2024-02-29T01:00:00.000Z");
    });

    it("is unaffected by daylight saving time since it operates in UTC", () => {
      const date = new Date("2025-03-09T01:00:00-08:00");
      const result = addHours(date, 2);
      expect(result.toISOString()).toBe("2025-03-09T11:00:00.000Z");
    });

    it("handles invalid date input gracefully", () => {
      const invalidDate = new Date("not-a-date");
      const result = addHours(invalidDate, 5);
      expect(result.toString()).toBe("Invalid Date");
    });

    it("handles non-Date, non-string input gracefully", () => {
      // @ts-expect-error
      const result = addHours(12345, 5);
      expect(result).toBeInstanceOf(Date);
      expect(isNaN(result.getTime())).toBe(false);
    });
  });

  describe("calculateEstimatedDelivery Function", () => {
    it("calculates estimated delivery date 48 hours from given date string", () => {
      const dateStr = "2025-03-25T00:00:00Z";
      const result = calculateEstimatedDelivery(dateStr);
      expect(result).toBe("2025-03-27");
    });

    it("calculates estimated delivery date 48 hours from given Date object", () => {
      const date = new Date("2025-03-25T00:00:00Z");
      const result = calculateEstimatedDelivery(date);
      expect(result).toBe("2025-03-27");
    });

    it("returns date in YYYY-MM-DD format", () => {
      const date = new Date("2025-12-30T00:00:00Z");
      const result = calculateEstimatedDelivery(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("adds the correct number of delivery days", () => {
      const date = new Date("2025-12-30T00:00:00Z");
      const result = calculateEstimatedDelivery(date);
      expect(result).toBe("2026-01-01");
    });

    it("handles leap year dates correctly", () => {
      const date = new Date("2024-02-27T00:00:00Z");
      const result = calculateEstimatedDelivery(date);
      expect(result).toBe("2024-02-29"); // lands on leap day
    });

    it("is unaffected by daylight saving time since it operates in UTC", () => {
      const date = new Date("2025-03-09T01:00:00-08:00");
      const result = calculateEstimatedDelivery(date);
      expect(result).toBe("2025-03-11");
    });

    it("handles invalid date input gracefully", () => {
      const invalidDate = new Date("not-a-date");
      const result = calculateEstimatedDelivery(invalidDate);
      expect(result).toBe("Invalid Date");
    });

    it("does not mutate the original Date object when given a Date", () => {
      const date = new Date("2025-03-25T00:00:00Z");
      const originalISOString = date.toISOString();
      calculateEstimatedDelivery(date);
      expect(date.toISOString()).toBe(originalISOString);
    });

    it("handles non-Date, non-string input gracefully", () => {
      // @ts-expect-error
      const result = calculateEstimatedDelivery(12345);
      expect(typeof result).toBe("string");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
