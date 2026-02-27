import prisma from "@/lib/prisma/client";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { z } from "zod";

export const testimonialsRouter = createTRPCRouter({
  getTestimonials: publicProcedure.query(async ({}) => {
    const testimonials = await prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
    });
    return testimonials;
  }),
  createTestimonial: publicProcedure
    .input(
      z.object({
        comment: z.string().min(1, "Comment is required"),
        authorName: z.string().optional(),
        isAnonymous: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const { comment, authorName, isAnonymous } = input;

        if (isAnonymous && authorName) {
          throw new Error("Author name must be empty when anonymous");
        }

        if (!isAnonymous && !authorName) {
          throw new Error("Author name is required when not anonymous");
        }

        if (!comment.trim()) {
          throw new Error("Comment cannot be empty");
        }

        const testimonial = await prisma.testimonial.create({
          data: {
            comment,
            authorName: isAnonymous ? "Anonymous" : authorName || "Anonymous",
            isApproved: false,
          },
        });

        return testimonial;
      } catch (error) {
        console.log(error);
        throw new Error("Failed to create testimonial");
      }
    }),
});
