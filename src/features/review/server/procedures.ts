import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { reviewSchema } from "@/lib/schemas/orderSchema";
import prisma from "@/lib/prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const reviewsRouter = createTRPCRouter({
  createReview: publicProcedure
    .input(
      z.object({
        orderId: z.string().min(1, "Order ID is required"),
        author: z.string().min(1, "Your name is required"),
        reviews: z.array(
          z.object({
            orderProductId: z.string().min(1),
            rating: z.number().min(1, "Rating is required").max(5),
            comment: z.string().optional().default(""),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const { orderId, author, reviews } = input;

      // Verify the order exists and is fulfilled — only fulfilled orders can be reviewed
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      if (order.status !== "FULFILLED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only fulfilled orders can be reviewed",
        });
      }

      const createdReviews = [];

      for (const review of reviews) {
        const { orderProductId, rating, comment } = review;

        const orderProduct = await prisma.orderProduct.findFirst({
          where: {
            id: orderProductId,
            orderId,
          },
          select: { id: true },
        });

        if (!orderProduct) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found in this order",
          });
        }

        const existingReview = await prisma.review.findFirst({
          where: { orderProductId },
        });

        if (existingReview) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You have already reviewed this product",
          });
        }

        const created = await prisma.review.create({
          data: {
            orderProductId,
            author,
            rating,
            comment: comment ?? "", // 👈 safety
          },
        });

        createdReviews.push(created);
      }

      return { success: true, reviews: createdReviews };
    }),
});
