import { PAGINATION, PRODUCT_INFO } from "@/config/constants";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma/client";
import {
  checkoutSchema,
  orderDetailsSchema,
  shippingInfoSchema,
  verifyPaymentSchema,
} from "@/lib/schemas/orderSchema";
import { isValidOrderStatus, OrderStatus } from "@/lib/utils";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

// Helper function to generate order number
const generateOrderNumber = async () => {
  return await prisma.$transaction(async (tx) => {
    const maxOrder = await tx.order.findFirst({
      where: {
        orderNumber: {
          startsWith: "ORD-",
        },
      },
      orderBy: {
        orderNumber: "desc",
      },
      select: {
        orderNumber: true,
      },
    });

    let nextNumber = 1;
    if (maxOrder?.orderNumber) {
      const numericPart = parseInt(maxOrder.orderNumber.split("-")[1], 10);
      if (!isNaN(numericPart)) {
        nextNumber = numericPart + 1;
      }
    }

    return `ORD-${String(nextNumber).padStart(4, "0")}`;
  });
};

export const orderRouter = createTRPCRouter({
  getAllOrders: protectedProcedure.query(async () => {
    return await prisma.order.findMany({
      include: {
        shippingInfo: true,
        products: {
          include: {
            product: true,
          },
        },
      },
    });
  }),

  getPaginatedOrders: protectedProcedure
    .input(
      z.object({
        search: z.string().default(""),
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        status: z.union([z.literal("ALL"), z.enum(OrderStatus)]).default("ALL"),

        startDate: z.date().optional(),
        endDate: z.date().optional(),
        minPrice: z.number().default(0),
        maxPrice: z.number().default(1000),
        sortField: z
          .enum(["orderNumber", "customer", "status", "total", "orderDate"])
          .optional(),
        sortDirection: z.enum(["asc", "desc"]).optional(),
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
        sortField,
        sortDirection,
      } = input;

      const where: Prisma.OrderWhereInput = {};

      if (status && status !== "ALL") {
        where.status = status;
      }

      const whereCondition = { ...where };

      if (search && search !== "") {
        whereCondition.OR = [
          {
            orderNumber: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            shippingInfo: {
              firstName: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            shippingInfo: {
              lastName: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            shippingInfo: {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ];
      }

      if (minPrice > 0 || maxPrice < PRODUCT_INFO.maxPrice) {
        whereCondition.total = {
          gte: minPrice,
          lte: maxPrice,
        };
      }

      // Date filter (orderDate is stored as string YYYY-MM-DD)
      if (startDate || endDate) {
        whereCondition.orderDate = {};

        if (startDate) {
          (whereCondition.orderDate as Prisma.DateTimeNullableFilter).gte =
            startDate.toISOString();
        }

        if (endDate) {
          (whereCondition.orderDate as Prisma.DateTimeNullableFilter).lte =
            endDate.toISOString();
        }
      }

      // Build orderBy - "customer" sorts on a relation field so needs special handling

      const dir = sortDirection ?? "desc";
      let orderBy: Prisma.OrderOrderByWithRelationInput;

      if (sortField === "customer") {
        orderBy = { shippingInfo: { firstName: dir } };
      } else if (sortField === "orderNumber") {
        orderBy = { orderNumber: dir };
      } else if (sortField === "status") {
        orderBy = { status: dir };
      } else if (sortField === "total") {
        orderBy = { total: dir };
      } else {
        // default: orderDate desc
        orderBy = { orderDate: dir };
      }

      const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            ...whereCondition,
          },
          include: {
            shippingInfo: true,
            products: {
              include: {
                product: true,
              },
            },
          },
          orderBy,
        }),

        prisma.order.count({
          where: {
            ...whereCondition,
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        orders,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),

  placeOrder: publicProcedure
    .input(orderDetailsSchema)
    .mutation(async ({ input }) => {
      // Implement order placement logic here
      const {
        id,
        paymentDate,
        products,
        referenceNumber,
        shippingFee,
        shippingInfo,
        status,
        subtotal,
        tax,
        total,
        orderDate,
        orderNumber,
        verificationCode,
      } = input;

      // Validate required fields
      if (!shippingInfo || !products || !products.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Shipping information and products are required",
        });
      }

      // Validate the status using the isValidOrderStatus function
      if (status && !isValidOrderStatus(status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid order status",
        });
      }

      // Generate order number if not provided
      const finalOrderNumber = orderNumber || (await generateOrderNumber());

      // Check if shipping info exists and update or create
      let shipping;
      const existingShippingInfo = await prisma.shippingInfo.findFirst({
        where: {
          AND: [
            { email: shippingInfo.email },
            { phoneNumber: shippingInfo.phoneNumber },
          ],
        },
      });

      if (existingShippingInfo) {
        shipping = await prisma.shippingInfo.update({
          where: { id: existingShippingInfo.id },
          data: {
            ...shippingInfo,
          },
        });
      } else {
        shipping = await prisma.shippingInfo.create({
          data: {
            ...shippingInfo,
          },
        });
      }

      if (!shipping) {
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Failed to create or update shipping info",
        });
      }

      // Create order
      const newOrder = await prisma.order.create({
        data: {
          orderId: id,
          paymentDate: paymentDate ? new Date(paymentDate).toISOString() : null,
          referenceNumber,
          shippingFee,
          status: status || ("UNVERIFIED" as OrderStatus),
          subtotal,
          tax,
          total,
          verificationCode,
          orderDate: orderDate
            ? new Date(orderDate).toISOString()
            : new Date().toISOString(),
          orderNumber: finalOrderNumber,
          shippingInfoId: shipping.id,
        },
        include: {
          shippingInfo: true,
        },
      });

      if (!newOrder) {
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Failed to create order",
        });
      }

      for (const product of products) {
        await prisma.orderProduct.create({
          data: {
            orderId: newOrder.id,
            productId: product.id,
            quantity: product.quantity,
          },
        });
      }

      return { success: true, order: newOrder };
    }),

  updateOrder: publicProcedure
    .input(verifyPaymentSchema)
    .mutation(async ({ input }) => {
      const { orderId, providedVerificationCode } = input;

      if (!orderId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order ID is required",
        });
      }

      if (!providedVerificationCode) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Verification code is required",
        });
      }

      // Fetch the order from the database
      const order = await prisma.order.findUnique({
        where: { orderId },
        include: {
          shippingInfo: true,
          products: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Check if the provided verification code matches
      if (order.verificationCode !== providedVerificationCode) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification code",
        });
      }

      // Generate new order number
      const newOrderNumber = await generateOrderNumber();

      // Update the order
      const updatedOrder = await prisma.order.update({
        where: { orderId },
        data: {
          status: "PENDING",
          orderNumber: newOrderNumber,
          orderDate: order.paymentDate, // Set orderDate to paymentDate
        },
        include: {
          shippingInfo: true,
          products: {
            include: {
              product: true,
            },
          },
        },
      });

      return {
        order: updatedOrder,
        success: true,
      };
    }),

  changeOrderStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        newStatus: z.enum(OrderStatus),
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

      const { orderId, newStatus } = input;

      if (!orderId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order ID is required",
        });
      }

      if (!newStatus) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Status is required",
        });
      }

      // Fetch the order from the database
      const order = await prisma.order.findUnique({
        where: { orderId },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      const updatedOrder = await prisma.order.update({
        where: {
          orderId,
        },
        data: {
          status: newStatus,
        },
        include: {
          shippingInfo: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          products: {
            select: {
              quantity: true,
              product: {
                select: {
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      return updatedOrder;
    }),
});
