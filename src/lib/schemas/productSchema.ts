import z from "zod";

export const productSchema = z.object({
  name: z.string().min(1, {
    message: "Product name is required",
  }),
  description: z.string().min(1, {
    message: "Product category is required",
  }),
  price: z.number().min(0, "Price must be a positive number"),
  category: z.string().min(1, {
    message: "Product category is required",
  }),
  assetId: z.string().optional(),
  rating: z.number().min(0),
});

export const createProductSchema = productSchema.extend({
  image: z.url("Image is required."),
});

export const updateProductSchema = productSchema.extend({
  id: z.string().optional(),
  image: z.url().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export type ProductFormValues = CreateProductInput & {
  id?: string;
};

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
