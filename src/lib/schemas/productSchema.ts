import z from "zod";

export const productSchema = z.object({
  name: z.string().min(1, {
    message: "Product name is required",
  }),
  category: z.string().min(1, {
    message: "Product category is required",
  }),
  description: z.string().optional(),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid price (e.g. 9.99)")
    .transform((val) => parseFloat(val)),
  image: z.url("Image is required."),
  assetId: z.string().optional(),
});

export type ProductSchema = z.infer<typeof productSchema>;

export const testimonialSchema = z
  .object({
    // id: z.string().uuid().optional(),
    comment: z
      .string()
      .min(1, "Comment is required")
      .max(1000, "Comment is too long"),
    isAnonymous: z.boolean(),
    authorName: z.string().optional(),
    isApproved: z.boolean().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  })
  .refine((data) => !data.isAnonymous || !data.authorName, {
    message: "Author name must be empty when anonymous",
    path: ["authorName"],
  });

export type TestimonialSchema = z.infer<typeof testimonialSchema>;
