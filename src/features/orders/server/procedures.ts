import { PAGINATION, PRODUCT_INFO } from "@/config/constants";
import { OrderStatus, Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma/client";
import {
  checkoutSchema,
  orderDetailsSchema,
  shippingInfoSchema,
  verifyPaymentSchema,
} from "@/lib/schemas/orderSchema";
import { isValidEmail } from "@/lib/utils";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export function isValidOrderStatus(status: string): status is OrderStatus {
  return Object.values(OrderStatus).includes(status as OrderStatus);
}

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

const addHours = (date: Date | string, hours: number) => {
  return new Date(new Date(date).getTime() + hours * 60 * 60 * 1000);
};

const calculateEstimatedDelivery = (date: string | Date) => {
  const base = new Date(date);
  if (isNaN(base.getTime())) return "Invalid Date";
  return new Date(base.getTime() + 48 * 3600000).toISOString().split("T")[0];
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
    .query(async ({ input }) => {
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

      const [rawOrders, totalCount] = await Promise.all([
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

      const currentDate = new Date();

      const orders = await Promise.all(
        rawOrders.map(async (order) => {
          let status = order.status;
          // 👇 Auto Fulfilled -> Delivered after 48h
          if (order.status === OrderStatus.FULFILLED && order.fulfilledAt) {
            const fulfilledAt = new Date(order.fulfilledAt);

            const diffInMs = currentDate.getTime() - fulfilledAt.getTime();

            const diffInHours = diffInMs / (1000 * 60 * 60);

            if (diffInHours >= 48) {
              status = OrderStatus.DELIVERED;

              await prisma.order.update({
                where: {
                  id: order.id,
                },

                data: {
                  status,
                },
              });
            }
          }

          return {
            id: order.id,

            orderId: order.orderId,

            orderNumber: order.orderNumber,

            subtotal: order.subtotal,

            tax: order.tax,

            shippingFee: order.shippingFee,

            total: order.total,

            paymentDate: order.paymentDate,

            paymentMethod: order.paymentMethod,

            orderDate: order.orderDate,

            referenceNumber: order.referenceNumber,

            verificationCode: order.verificationCode,

            orderType: order.orderType,

            status,

            scheduledAt: order.scheduledAt,

            fulfilledAt: order.fulfilledAt,

            cancellationRequestedAt: order.cancellationRequestedAt,

            cancellationDate: order.cancellationDate,

            cancellationReason: order.cancellationReason,

            refundReferenceNumber: order.refundReferenceNumber,

            shippingInfo: {
              id: order.shippingInfo.id,

              firstName: order.shippingInfo.firstName,

              lastName: order.shippingInfo.lastName,

              email: order.shippingInfo.email,

              phoneNumber: order.shippingInfo.phoneNumber,

              address: order.shippingInfo.address,

              city: order.shippingInfo.city,

              postalCode: order.shippingInfo.postalCode,

              orderNotes: order.shippingInfo.orderNotes,
            },

            products: order.products.map((op) => ({
              id: op.id,

              quantity: op.quantity,

              product: {
                id: op.product.id,

                name: op.product.name,

                description: op.product.description,

                price: op.product.price,

                assetId: op.product.assetId,

                category: op.product.category,

                rating: op.product.rating,
              },
            })),
          };
        }),
      );

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

  getOrder: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { orderId } = input;

      const order = await prisma.order.findUnique({
        where: { orderId },
        include: {
          shippingInfo: true,
          products: {
            select: {
              id: true,
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

      if (!order) return null;

      const now = new Date();

      let timeRemaining: string | null = null;
      let canCancel = false;

      if (order.scheduledAt) {
        const diffMs = order.scheduledAt.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        const cancellableStatuses: OrderStatus[] = [
          OrderStatus.UNVERIFIED,
          OrderStatus.PENDING,
        ];

        canCancel = cancellableStatuses.includes(order.status) && diffHours > 0;

        // canCancel =
        //   cancellableStatuses.includes(order.status) &&
        //   diffHours > 0 &&
        //   diffHours <= 24;

        if (canCancel) {
          if (diffHours >= 24) {
            const days = Math.floor(diffHours / 24);
            const hours = diffHours % 24;
            timeRemaining = `${days}d ${hours}h remaining`;
          } else {
            timeRemaining = `${diffHours}h remaining`;
          }
        }
      }

      return {
        ...order,
        timeRemaining,
        canCancel,
        products: order.products.map((item) => ({
          id: item.id,
          name: item.product.name,
          quantity: item.quantity,
          basePrice: item.product.price,
          price: item.product.price * item.quantity,
        })),
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

      // Calculate estimated delivery date (48 hours after paymentDate)
      const estimatedDelivery = calculateEstimatedDelivery(
        order.paymentDate ?? new Date().toISOString().split("T")[0],
      );

      // Update the order
      const updatedOrder = await prisma.order.update({
        where: { orderId },
        data: {
          status: "PENDING",
          orderNumber: newOrderNumber,
          orderDate: order.paymentDate, // Set orderDate to paymentDate
          scheduledAt: new Date(estimatedDelivery), // Set scheduledAt to estimated delivery date
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
    .mutation(async ({ input }) => {
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

      if (newStatus === "CANCELLED" || newStatus === "CANCELLATION_REQUESTED") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Order cannot be cancelled from this action",
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

      let updatedOrder;

      if (newStatus === "FULFILLED") {
        updatedOrder = await prisma.order.update({
          where: {
            orderId,
          },
          data: {
            status: newStatus,
            fulfilledAt: new Date(),
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
      } else {
        updatedOrder = await prisma.order.update({
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
      }

      return updatedOrder;
    }),

  requestCancelOrder: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        reason: z.string(),
        interacEmail: z
          .email()
          .optional()
          .refine((email) => {
            if (!email) return true; // allow empty if not e-transfer
            return isValidEmail(email);
          }, "Please enter a valid email address"),
      }),
    )
    .mutation(async ({ input }) => {
      const { orderId, reason, interacEmail } = input;

      // TODO: Find order by orderId, if not found throw error
      const order = await prisma.order.findFirst({
        where: {
          orderId: orderId,
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // 2️⃣ Validate scheduledAt exists
      if (!order.scheduledAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order is not scheduled yet",
        });
      }

      // TODO: check if order is eligible for cancellation (status is PENDING or UNVERIFIED, and time is less than 24 hours from orderDate + 48 hours), if not throw error
      // 3️⃣ Check allowed statuses
      const validStatuses: OrderStatus[] = [
        OrderStatus.UNVERIFIED,
        OrderStatus.PENDING,
      ];

      const validStatus = validStatuses.includes(order.status);

      // 4️⃣ Check time window (within 24 hours BEFORE scheduledAt)
      const now = new Date();
      const diffInMs = order.scheduledAt.getTime() - now.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);

      const within24Hours = diffInHours <= 24;

      if (!validStatus || within24Hours) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Order cannot be cancelled. It must be UNVERIFIED or PENDING and within 24 hours of scheduled time.",
        });
      }
      // 5️⃣ Update order
      const updatedOrder = await prisma.order.update({
        where: { orderId },
        data: {
          status: OrderStatus.CANCELLATION_REQUESTED,
          cancellationReason: reason,
          cancellationRequestedAt: new Date(),
          interacEmail,
        },
        select: {
          orderNumber: true,
          orderDate: true,
          total: true,
          cancellationReason: true,
          interacEmail: true,
          shippingInfo: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return { success: true, order: updatedOrder };
    }),

  processOrderCancel: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        refundReferenceNumber: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { orderId, refundReferenceNumber } = input;
      // update the cancellation date to 2 days after the cancellationRequestedAt and set the refundReferenceNumber
      if (!orderId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order ID required.",
        });
      }

      if (!refundReferenceNumber) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Refund Reference Number required",
        });
      }

      const order = await prisma.order.findUniqueOrThrow({
        where: { orderId },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not available",
        });
      }

      if (
        order.status !== OrderStatus.CANCELLATION_REQUESTED &&
        !order.cancellationRequestedAt
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order not available for cancellation",
        });
      }

      if (!order.cancellationRequestedAt) return null;
      const cancellationDate = addHours(order.cancellationRequestedAt, 48);

      const update = await prisma.order.update({
        where: { orderId },
        data: {
          refundReferenceNumber,
          cancellationDate,
          status: OrderStatus.CANCELLED,
        },
        select: {
          orderNumber: true,
          total: true,
          shippingInfo: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return { success: 200 };
    }),
});
