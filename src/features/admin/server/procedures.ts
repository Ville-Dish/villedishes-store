import { PAGINATION, TRANSACTION_INFO } from "@/config/constants";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma/client";
import { isValidPhoneNumber } from "@/lib/utils";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const calculateMonthlyRevenue = async (year: number, month: number) => {
  // const startDate = new Date(year, month - 1, 1);
  // const endDate = new Date(year, month, 0);

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const [orders, invoices, incomes] = await Promise.all([
    prisma.order.findMany({
      where: {
        orderDate: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
        status: {
          in: ["PENDING", "FULFILLED"],
        },
      },
      select: {
        total: true,
      },
    }),
    prisma.invoice.findMany({
      where: {
        dateCreated: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
        status: "PAID",
      },
      select: {
        amount: true,
      },
    }),
    prisma.income.findMany({
      where: {
        date: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
      },
      select: {
        amount: true,
      },
    }),
  ]);

  const orderTotal = orders.reduce((sum, order) => sum + order.total, 0);
  const invoiceTotal = invoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0,
  );
  const incomeTotal = incomes.reduce((sum, income) => sum + income.amount, 0);

  return orderTotal + invoiceTotal + incomeTotal;
};

export const adminSettingsProcedures = createTRPCRouter({
  // Income
  getAllIncomeData: protectedProcedure.query(async () => {
    const incomes = await prisma.income.findMany();
    return incomes;
  }),

  getFilteredIncomes: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        category: z.string().default("ALL"),
        minAmount: z.number().default(0),
        maxAmount: z.number().default(1000),
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        sortField: z.enum(["name", "category", "date", "amount"]).nullish(),
        sortDirection: z.enum(["asc", "desc"]).nullish(),
      }),
    )
    .query(async ({ input }) => {
      const {
        startDate,
        endDate,
        category,
        page,
        pageSize,
        minAmount,
        maxAmount,
        sortField,
        sortDirection,
      } = input;

      const where: Prisma.IncomeWhereInput = {};

      if (category && category !== "ALL") {
        where.category = category;
      }

      const whereCondition = { ...where };

      if (minAmount > 0 || maxAmount < TRANSACTION_INFO.maxPrice) {
        whereCondition.amount = {
          gte: minAmount,
          lte: maxAmount,
        };
      }

      // Date filter (orderDate is stored as string YYYY-MM-DD)
      if (startDate || endDate) {
        whereCondition.date = {};

        if (startDate) {
          (whereCondition.date as Prisma.DateTimeNullableFilter).gte =
            startDate.toISOString();
        }

        if (endDate) {
          (whereCondition.date as Prisma.DateTimeNullableFilter).lte =
            endDate.toISOString();
        }
      }

      // Build orderBy - "name" sorts on a relation field so needs special handling
      const dir = sortDirection ?? "desc";
      let orderBy: Prisma.IncomeOrderByWithRelationInput;

      if (sortField === "name") {
        orderBy = { name: dir };
      } else if (sortField === "category") {
        orderBy = { category: dir };
      } else if (sortField === "amount") {
        orderBy = { amount: dir };
      } else {
        // default: orderDate desc
        orderBy = { date: dir };
      }

      const [incomes, incomeCategory, totalCount] = await Promise.all([
        prisma.income.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            ...whereCondition,
          },
          orderBy,
        }),

        prisma.income.findMany({
          select: { category: true },
          distinct: ["category"],
          orderBy: { category: "asc" },
        }),

        prisma.income.count({
          where: {
            ...whereCondition,
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      const incomeCategoryList = incomeCategory.map((item) => item.category);

      return {
        incomes,
        incomeCategoryList,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),

  addIncome: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        category: z.string(),
        amount: z.number(),
        date: z.date(),
      }),
    )
    .mutation(async ({ input }) => {
      const { name, category, amount, date } = input;

      if (!name || !category || !amount || !date) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ensure all data is provided",
        });
      }

      const newIncome = await prisma.income.create({
        data: {
          name,
          category,
          amount,
          date,
        },
      });

      return newIncome;
    }),

  updateIncome: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        category: z.string().optional(),
        amount: z.number().optional(),
        date: z.date().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { name, category, amount, date } = input;

      const updatedIncome = await prisma.income.update({
        where: {
          id: input.id,
        },
        data: {
          name,
          category,
          amount,
          date,
        },
      });

      return updatedIncome;
    }),

  deleteIncome: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Income ID is required",
        });
      }

      const income = await prisma.income.findUniqueOrThrow({
        where: {
          id,
        },
      });

      if (!income) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Income not found",
        });
      }

      await prisma.income.delete({
        where: {
          id,
        },
      });

      return { success: true };
    }),

  // Expense
  getAllExpenseData: protectedProcedure.query(async () => {
    return await prisma.expense.findMany();
  }),

  getFilteredExpenses: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        category: z.string().default("ALL"),
        minAmount: z.number().default(0),
        maxAmount: z.number().default(1000),
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        sortField: z.enum(["name", "category", "date", "amount"]).nullish(),
        sortDirection: z.enum(["asc", "desc"]).nullish(),
      }),
    )
    .query(async ({ input }) => {
      const {
        startDate,
        endDate,
        category,
        page,
        pageSize,
        minAmount,
        maxAmount,
        sortField,
        sortDirection,
      } = input;

      const where: Prisma.ExpenseWhereInput = {};

      if (category && category !== "ALL") {
        where.category = category;
      }

      const whereCondition = { ...where };

      if (minAmount > 0 || maxAmount < TRANSACTION_INFO.maxPrice) {
        whereCondition.amount = {
          gte: minAmount,
          lte: maxAmount,
        };
      }

      // Date filter (orderDate is stored as string YYYY-MM-DD)
      if (startDate || endDate) {
        whereCondition.date = {};

        if (startDate) {
          (whereCondition.date as Prisma.DateTimeNullableFilter).gte =
            startDate.toISOString();
        }

        if (endDate) {
          (whereCondition.date as Prisma.DateTimeNullableFilter).lte =
            endDate.toISOString();
        }
      }

      // Build orderBy - "name" sorts on a relation field so needs special handling
      const dir = sortDirection ?? "desc";
      let orderBy: Prisma.ExpenseOrderByWithRelationInput;

      if (sortField === "name") {
        orderBy = { name: dir };
      } else if (sortField === "category") {
        orderBy = { category: dir };
      } else if (sortField === "amount") {
        orderBy = { amount: dir };
      } else {
        // default: orderDate desc
        orderBy = { date: dir };
      }

      const [expenses, expenseCategory, totalCount] = await Promise.all([
        prisma.expense.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            ...whereCondition,
          },
          orderBy,
        }),

        prisma.expense.findMany({
          select: { category: true },
          distinct: ["category"],
          orderBy: { category: "asc" },
        }),

        prisma.expense.count({
          where: {
            ...whereCondition,
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      const expenseCategoryList = expenseCategory.map((item) => item.category);

      return {
        expenses,
        expenseCategoryList,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),

  addExpense: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        category: z.string(),
        amount: z.number(),
        date: z.date(),
      }),
    )
    .mutation(async ({ input }) => {
      const { name, category, amount, date } = input;

      if (!name || !category || !amount || !date) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ensure all data is provided",
        });
      }

      const newExpense = await prisma.expense.create({
        data: {
          name,
          category,
          amount,
          date,
        },
      });

      return newExpense;
    }),

  updateExpense: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        category: z.string().optional(),
        amount: z.number().optional(),
        date: z.date().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { name, category, amount, date } = input;

      const updatedIncome = await prisma.expense.update({
        where: {
          id: input.id,
        },
        data: {
          name,
          category,
          amount,
          date,
        },
      });

      return updatedIncome;
    }),

  deleteExpense: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Expense ID is required",
        });
      }

      const expense = await prisma.expense.findUniqueOrThrow({
        where: {
          id,
        },
      });

      if (!expense) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Income not found",
        });
      }

      await prisma.expense.delete({
        where: {
          id,
        },
      });

      return { success: true };
    }),

  // Revenue
  getAllRevenueData: protectedProcedure.query(async () => {
    try {
      const revenues = await prisma.revenue.findMany({
        include: {
          monthlyProjections: true,
        },
      });

      const MONTHS = [
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

      // Update all actual values first, then fetch fresh data
      await prisma.$transaction(async (tx) => {
        await Promise.all(
          revenues.flatMap((revenue) =>
            revenue.monthlyProjections.map(async (mp) => {
              const monthIndex = MONTHS.indexOf(mp.month) + 1;
              const calculatedActual = await calculateMonthlyRevenue(
                revenue.year,
                monthIndex,
              );
              return tx.monthlyProjection.update({
                where: { id: mp.id },
                data: { actual: calculatedActual },
              });
            }),
          ),
        );
      });

      const updatedRevenues = await prisma.revenue.findMany({
        include: { monthlyProjections: true },
      });

      return updatedRevenues;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch revenues",
      });
    }
  }),

  addRevenue: protectedProcedure
    .input(
      z.object({
        year: z.number(),
        yearlyTarget: z.number(),
        monthlyProjections: z.array(
          z.object({
            month: z.string(),
            projection: z.number(),
            actual: z.number().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const { year, yearlyTarget, monthlyProjections } = input;

      if (!year || !yearlyTarget || monthlyProjections.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid input data",
        });
      }

      const revenue = await prisma.revenue.create({
        data: {
          year,
          yearlyTarget,
          monthlyProjections: {
            create: monthlyProjections.map((mp) => ({
              month: mp.month,
              projection: mp.projection,
              actual: mp.actual ?? 0,
            })),
          },
        },
        include: {
          monthlyProjections: true,
        },
      });

      return revenue;
    }),

  updateRevenue: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        monthlyProjections: z.array(
          z.object({
            id: z.string(),
            projection: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, monthlyProjections } = input;

      try {
        const updatedRevenue = await prisma.$transaction(async (tx) => {
          // 1. Update all monthly projections
          await Promise.all(
            monthlyProjections.map((mp) =>
              tx.monthlyProjection.update({
                where: { id: mp.id },
                data: {
                  projection: mp.projection,
                },
              }),
            ),
          );

          // 2. Fetch all updated monthly projections
          const revenue = await tx.revenue.findUnique({
            where: { id },
            include: {
              monthlyProjections: true,
            },
          });

          if (!revenue) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Revenue record not found",
            });
          }

          // 3. Calculate yearly total
          const yearlyTarget = revenue.monthlyProjections.reduce(
            (total, month) => total + month.projection,
            0,
          );

          // 4. Update yearly target
          const finalRevenue = await tx.revenue.update({
            where: { id },
            data: {
              yearlyTarget,
            },
            include: {
              monthlyProjections: true,
            },
          });

          return finalRevenue;
        });

        return updatedRevenue;
      } catch (error) {
        console.error(error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update revenue",
        });
      }
    }),

  deleteRevenue: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Revenue ID is required",
        });
      }

      const revenue = await prisma.revenue.findUnique({
        where: { id },
      });

      if (!revenue) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Revenue not found",
        });
      }

      await prisma.revenue.delete({
        where: { id },
      });

      return { success: true };
    }),

  getCompanySettings: protectedProcedure.query(async () => {
    const settings = await prisma.companySettings.findFirst();
    return settings;
  }),

  updateCompanySettings: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        companyName: z.string().min(1, "Company name is required"),
        about: z.array(z.string()).optional(),
        founderNotes: z.array(z.string()).optional(),
        supportEmail: z.email("Please enter a valid email address").optional(),
        supportPhone: z
          .string({ message: "Phone number is required" })
          .trim()
          .min(1, "Phone number is required")
          .refine(isValidPhoneNumber, {
            message: "Please enter a valid phone number",
          })
          .optional(),
        website: z.url("Please enter a valid URL").optional(),
        address: z.string().optional(),
        assetId: z.string().optional(),
        logoUrl: z.url("Please enter a valid URL").optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const {
        id,
        companyName,
        about,
        founderNotes,
        supportEmail,
        supportPhone,
        website,
        address,
        logoUrl,
        assetId,
      } = input;

      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Company ID is required",
        });
      }

      const settings = await prisma.companySettings.findUnique({
        where: { id },
      });

      if (!settings) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company settings not found",
        });
      }

      const updatedSettings = await prisma.companySettings.update({
        where: { id },
        data: {
          companyName,
          about,
          founderNotes,
          supportEmail,
          supportPhone,
          website,
          address,
          assetId,
          logoUrl,
        },
      });

      return updatedSettings;
    }),
});
