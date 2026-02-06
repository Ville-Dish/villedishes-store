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
