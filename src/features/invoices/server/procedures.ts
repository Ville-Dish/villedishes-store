import { PAGINATION, PRODUCT_INFO } from "@/config/constants";
import { DiscountType, Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma/client";
import { InvoiceStatus, isValidInvoiceStatus } from "@/lib/utils";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const generateInvoiceNumber = async () => {
  return await prisma.$transaction(async (tx) => {
    const maxInvoice = await tx.invoice.findFirst({
      orderBy: {
        invoiceNumber: "desc",
      },
      select: {
        invoiceNumber: true,
      },
    });

    let nextNumber = 1;
    if (maxInvoice?.invoiceNumber) {
      const numericPart = parseInt(maxInvoice.invoiceNumber.split("-")[1], 10);
      if (!isNaN(numericPart)) {
        nextNumber = numericPart + 1;
      }
    }

    const newInvoiceNumber = `INV-${String(nextNumber).padStart(4, "0")}`;

    // Create a placeholder invoice to reserve the number
    await tx.invoice.create({
      data: {
        invoiceNumber: newInvoiceNumber,
        customerName: "Placeholder",
        customerEmail: "placeholder@example.com",
        customerPhone: "0000000000",
        amount: 0,
        amountPaid: 0,
        amountDue: 0,
        discountPercentage: 0,
        status: "PENDING",
        dateCreated: new Date().toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
      },
    });

    return newInvoiceNumber;
  });
};

export const invoiceRouter = createTRPCRouter({
  getAllInvoices: protectedProcedure.query(async ({ ctx }) => {
    const session = ctx.session;
    if (!session || !session.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized for this feature!",
      });
    }
    const currentDate = new Date();

    // Retrieve all invoices
    const invoices = await prisma.invoice.findMany({
      include: {
        InvoiceProducts: {
          include: {
            Product: true,
          },
        },
      },
    });

    // Transform the data to match the expected format
    const transformedInvoices = await Promise.all(
      invoices.map(async (invoice) => {
        let status = invoice.status;
        let amountDue = invoice.amountDue;
        let amountPaid = invoice.amountPaid;
        const dueDate = new Date(invoice.dueDate);

        //Check if the invoice is overdue and not already marked as PAID
        if (currentDate > dueDate && invoice.status !== InvoiceStatus.PAID) {
          status = InvoiceStatus.OVERDUE;

          //Update the status in the database
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { status },
          });
        } else if (
          invoice.status === InvoiceStatus.PENDING &&
          invoice.InvoiceProducts &&
          invoice.InvoiceProducts.length > 0
        ) {
          status = InvoiceStatus.UNPAID;

          //Update the status in the database
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { status },
          });
        } else if (invoice.status === InvoiceStatus.PAID) {
          amountPaid = invoice.amount;
          amountDue = 0;
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { amountPaid, amountDue },
          });
        }

        return {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerName: invoice.customerName,
          customerEmail: invoice.customerEmail,
          customerPhone: invoice.customerPhone,
          amount: invoice.amount,
          amountPaid: invoice.amountPaid,
          amountDue: invoice.amountDue,
          dateCreated: invoice.dateCreated,
          dueDate: invoice.dueDate,
          status: invoice.status,
          discountPercentage: invoice.discountPercentage,
          discountType: invoice.discountType,
          taxRate: invoice.taxRate,
          taxType: invoice.taxType,
          shippingFee: invoice.shippingFee,
          serviceCharge: invoice.serviceCharge,
          miscellaneous: invoice.miscellaneous,
          products: invoice.InvoiceProducts.map((ip) => ({
            id: ip.Product[0]?.id,
            name: ip.Product[0]?.name,
            basePrice: ip.basePrice,
            quantity: ip.quantity,
            discount: ip.discount,
            category: ip.Product?.[0]?.category,
          })),
        };
      }),
    );

    return transformedInvoices;
  }),

  //   Paginated Invoice
  getPaginatedInvoices: protectedProcedure
    .input(
      z.object({
        search: z.string().default(""),
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        status: z
          .union([z.literal("ALL"), z.enum(InvoiceStatus)])
          .default("ALL"),

        startDate: z.date().optional(),
        endDate: z.date().optional(),
        minPrice: z.number().default(0),
        maxPrice: z.number().default(1000),
      }),
    )
    .query(async ({ ctx, input }) => {
      const session = ctx.session;
      if (!session || !session.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized for this feature!",
        });
      }

      const {
        startDate,
        endDate,
        status,
        search,
        page,
        pageSize,
        minPrice,
        maxPrice,
      } = input;

      const where: Prisma.InvoiceWhereInput = {};

      const whereCondition = { ...where };

      if (search && search !== "") {
        whereCondition.OR = [
          {
            invoiceNumber: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            customerName: {
              contains: search,
              mode: "insensitive",
            },
          },
        ];
      }

      if (minPrice > 0 || maxPrice < PRODUCT_INFO.maxPrice) {
        whereCondition.amount = {
          gte: minPrice,
          lte: maxPrice,
        };
      }

      // Date filter (orderDate is stored as string YYYY-MM-DD)
      if (startDate || endDate) {
        where.dueDate = {};

        if (startDate) {
          where.dueDate.gte = startDate.toISOString();
        }

        if (endDate) {
          where.dueDate.lte = endDate.toISOString();
        }
      }

      // Retrieve all invoices
      const [rawInvoices, totalCount, products] = await Promise.all([
        prisma.invoice.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            ...whereCondition,
          },
          include: {
            InvoiceProducts: {
              include: {
                Product: true,
              },
            },
          },
        }),

        prisma.invoice.count({
          where: {
            ...whereCondition,
          },
        }),

        prisma.product.findMany(),
      ]);

      const currentDate = new Date();

      // Transform the data to match the expected format
      const invoices = await Promise.all(
        rawInvoices.map(async (invoice) => {
          let status = invoice.status;
          let amountPaid = invoice.amountPaid;
          let amountDue = invoice.amountDue;

          const dueDate = new Date(invoice.dueDate);

          // Overdue logic
          if (currentDate > dueDate && invoice.status !== InvoiceStatus.PAID) {
            status = InvoiceStatus.OVERDUE;

            await prisma.invoice.update({
              where: { id: invoice.id },
              data: { status },
            });
          }

          // Pending → Unpaid
          else if (
            invoice.status === InvoiceStatus.PENDING &&
            invoice.InvoiceProducts?.length > 0
          ) {
            status = InvoiceStatus.UNPAID;

            await prisma.invoice.update({
              where: { id: invoice.id },
              data: { status },
            });
          }

          // Paid logic
          else if (invoice.status === InvoiceStatus.PAID) {
            amountPaid = invoice.amount;
            amountDue = 0;

            await prisma.invoice.update({
              where: { id: invoice.id },
              data: { amountPaid, amountDue },
            });
          }

          return {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            customerName: invoice.customerName,
            customerEmail: invoice.customerEmail,
            customerPhone: invoice.customerPhone,
            amount: invoice.amount,
            amountPaid,
            amountDue,
            dateCreated: invoice.dateCreated,
            dueDate: invoice.dueDate,
            status,
            discountPercentage: invoice.discountPercentage,
            discountType: invoice.discountType,
            taxRate: invoice.taxRate,
            taxType: invoice.taxType,
            shippingFee: invoice.shippingFee,
            serviceCharge: invoice.serviceCharge,
            miscellaneous: invoice.miscellaneous,
            products: invoice.InvoiceProducts.map((ip) => ({
              id: ip.Product?.[0]?.id,
              name: ip.Product?.[0]?.name,
              basePrice: ip.basePrice,
              quantity: ip.quantity,
              discount: ip.discount,
              category: ip.Product?.[0]?.category,
            })),
          };
        }),
      );

      // ───── PAGINATION METADATA ─────
      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        invoices,
        products,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),

  // Create new invoice
  createInvoice: protectedProcedure
    .input(
      z.object({
        customerName: z.string().min(1, "Customer name is required"),
        customerEmail: z.string().email("Invalid email"),
        customerPhone: z.string().min(1, "Customer phone is required"),
        dueDate: z.string().min(1, "Due date is required"), // stored as YYYY-MM-DD
        status: z
          .enum(["PENDING", "UNPAID", "PAID", "OVERDUE"])
          .optional()
          .default("PENDING"),
        amount: z.number().nonnegative().optional().default(0),
        discountPercentage: z.number().min(0).optional().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = ctx.session;
      if (!session || !session.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized for this feature!",
        });
      }

      const {
        customerName,
        customerEmail,
        customerPhone,
        dueDate,
        status,
        amount,
        discountPercentage,
      } = input;

      // Validate status again for safety
      if (!isValidInvoiceStatus(status as string)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid invoice status",
        });
      }

      // Generate invoice number
      const invoiceNumber = await generateInvoiceNumber();

      if (!invoiceNumber) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate invoice number",
        });
      }

      const newInvoice = await prisma.invoice.create({
        data: {
          customerName,
          customerEmail,
          customerPhone,
          amount,
          discountPercentage,
          dateCreated: new Date().toISOString().split("T")[0], // YYYY-MM-DD
          dueDate,
          status,
          invoiceNumber,
        },
      });

      return newInvoice;
    }),

  // Update new invoice
  updateInvoice: protectedProcedure
    .input(
      z.object({
        id: z.string(),

        customerName: z.string().optional(),
        customerEmail: z.string().optional(),
        customerPhone: z.string().optional(),
        dueDate: z.string().optional(),

        status: z.enum(InvoiceStatus).optional(),

        amount: z.number().optional(),
        amountPaid: z.number().optional(),
        amountDue: z.number().optional(),

        discountPercentage: z.number().optional(),
        discountType: z.enum(DiscountType).optional(),
        taxRate: z.number().optional(),
        taxType: z.enum(DiscountType).optional(),
        shippingFee: z.number().optional(),
        serviceCharge: z.number().optional(),
        miscellaneous: z.number().optional(),

        products: z
          .array(
            z.object({
              id: z.string(),
              basePrice: z.number(),
              quantity: z.number(),
              discount: z.number().optional(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = ctx.session;
      if (!session || !session.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized for this feature!",
        });
      }

      const { id, products, status, dueDate, ...rest } = input;

      const updateData: Prisma.InvoiceUpdateInput = {
        ...(rest.customerName && { customerName: rest.customerName }),
        ...(rest.customerEmail && { customerEmail: rest.customerEmail }),
        ...(rest.customerPhone && { customerPhone: rest.customerPhone }),
        ...(rest.amount !== undefined && { amount: rest.amount }),
        ...(rest.discountPercentage !== undefined && {
          discountPercentage: rest.discountPercentage,
        }),
        ...(rest.taxRate !== undefined && { taxRate: rest.taxRate }),
        ...(rest.shippingFee !== undefined && {
          shippingFee: rest.shippingFee,
        }),
        ...(rest.serviceCharge !== undefined && {
          serviceCharge: rest.serviceCharge,
        }),
        ...(rest.miscellaneous !== undefined && {
          miscellaneous: rest.miscellaneous,
        }),
        ...(rest.discountType && { discountType: rest.discountType }),
        ...(rest.taxType && { taxType: rest.taxType }),
        ...(dueDate && { dueDate }),
      };

      const currentDate = new Date();
      const invoiceDueDate = dueDate ? new Date(dueDate) : undefined;

      const updatedInvoice = await prisma.$transaction(async (tx) => {
        // 1️⃣ Update base invoice fields
        await tx.invoice.update({
          where: { id },
          data: updateData,
        });

        // 2️⃣ Update products if provided
        if (products) {
          await tx.invoiceProducts.deleteMany({
            where: { invoiceId: id },
          });

          for (const product of products) {
            await tx.invoiceProducts.create({
              data: {
                invoiceId: id,
                basePrice: product.basePrice,
                quantity: product.quantity,
                price: product.basePrice * product.quantity,
                discount: product.discount ?? 0,
                Product: {
                  connect: { id: product.id },
                },
              },
            });
          }
        }

        // 3️⃣ Recompute status
        let computedStatus: InvoiceStatus;

        if (products && products.length > 0) {
          computedStatus = InvoiceStatus.UNPAID;
        } else {
          computedStatus = InvoiceStatus.PENDING;
        }

        let statsuCheck =
          computedStatus === InvoiceStatus.UNPAID ||
          computedStatus === InvoiceStatus.PENDING ||
          computedStatus !== InvoiceStatus.OVERDUE;
        if (invoiceDueDate && currentDate > invoiceDueDate && statsuCheck) {
          computedStatus = InvoiceStatus.OVERDUE;
        }

        // Manual override
        if (status) {
          computedStatus = status;
        }

        // 4️⃣ Compute payment values
        const invoiceRecord = await tx.invoice.findUnique({
          where: { id },
        });

        if (!invoiceRecord) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invoice not found",
          });
        }

        let amountPaid = invoiceRecord.amountPaid;
        let amountDue = invoiceRecord.amountDue;

        if (computedStatus === InvoiceStatus.PAID) {
          amountPaid = invoiceRecord.amount;
          amountDue = 0;
        } else {
          amountPaid = 0;
          amountDue = invoiceRecord.amount;
        }

        // 5️⃣ Final update
        const finalInvoice = await tx.invoice.update({
          where: { id },
          data: {
            status: computedStatus,
            amountPaid,
            amountDue,
          },
        });

        return finalInvoice;
      });

      return updatedInvoice;
    }),

  // Delete new invoice
  deleteInvoice: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = ctx.session;
      if (!session || !session.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized for this feature!",
        });
      }

      const { id } = input;

      return await prisma.invoice.delete({
        where: { id },
      });
    }),
});
