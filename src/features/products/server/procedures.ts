import { PAGINATION, PRODUCT_INFO } from "@/config/constants";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma/client";
import {
  createProductSchema,
  productSchema,
  updateProductSchema,
} from "@/lib/schemas/productSchema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const productsRouter = createTRPCRouter({
  getAllProducts: publicProcedure.query(async () => {
    return await prisma.product.findMany({
      include: {
        OrderProduct: true, // Assuming you want to include related order products
      },
    });
  }),

  getPaginatedProducts: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        rating: z.string().optional(),
        search: z.string().default(""),
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        minPrice: z.number().default(0),
        maxPrice: z.number().default(1000),
      }),
    )
    .query(async ({ input }) => {
      const { category, rating, search, page, pageSize, minPrice, maxPrice } =
        input;

      const where: Prisma.ProductWhereInput = {};

      if (category && category !== "ALL") {
        where.category = category;
      }

      if (rating && rating !== "ALL") {
        where.rating = {
          lte: Number(rating),
        };
      }

      const whereCondition = { ...where };

      if (search && search !== "") {
        whereCondition.name = {
          contains: search,
          mode: "insensitive",
        };
      }

      if (minPrice > 0 || maxPrice < PRODUCT_INFO.maxPrice) {
        whereCondition.price = {
          gte: minPrice,
          lte: maxPrice,
        };
      }

      const [products, totalCount, categoriesList] = await Promise.all([
        prisma.product.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            ...whereCondition,
          },
          omit: {
            invoiceId: true,
          },
        }),

        prisma.product.count({
          where: {
            ...whereCondition,
          },
        }),

        prisma.product.findMany({
          where: {
            category: {
              not: null,
            },
          },
          select: {
            category: true,
          },
          distinct: ["category"],
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      const categories = categoriesList.map((c) => c.category!);

      return {
        products,
        categories,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),

  createProduct: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Product name is required"),
        description: z.string().min(1, "Product description is required"),
        price: z.number().min(0, "Product price must be a positive number"),
        image: z.url("Image is required."),
        assetId: z.string().optional(),
        category: z.string().min(1, "Product Category is required"),
        rating: z
          .number()
          .min(0, "Product rating must be a positive number")
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const validatedInput = createProductSchema.parse(input);
      return await prisma.product.create({ data: { ...validatedInput } });
    }),

  updateProduct: protectedProcedure
    .input(updateProductSchema)
    .mutation(async ({ ctx, input }) => {
      const session = ctx.session;
      if (!session || !session.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized for this feature!",
        });
      }
      const validatedInput = updateProductSchema.parse(input);
      return await prisma.product.update({
        where: { id: validatedInput.id },
        data: validatedInput,
      });
    }),

  deleteProduct: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id } = input;
      return await prisma.product.delete({
        where: { id },
      });
    }),

  getCategories: protectedProcedure.query(async () => {
    const categories = (
      await prisma.product.findMany({
        where: { category: { not: null } },
        select: { category: true },
        distinct: ["category"],
        orderBy: { category: "asc" },
      })
    ).flatMap((c) => (c.category ? [c.category] : []));

    return categories;
  }),
});
