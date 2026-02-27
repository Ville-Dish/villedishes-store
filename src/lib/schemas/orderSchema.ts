import z from "zod";

/**
 * 1️⃣ Base schema (NO refinements here)
 */
const checkoutBaseSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(5, "Valid postal code is required"),
  orderNotes: z.string().optional(),
  paymentStatus: z.boolean(),
  referenceNumber: z.string().optional(),
});

/**
 * 2️⃣ Add refinement separately
 */
export const checkoutSchema = checkoutBaseSchema.superRefine((data, ctx) => {
  if (data.paymentStatus && !data.referenceNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Reference number is required when payment is completed",
      path: ["referenceNumber"],
    });
  }
});

export type CheckoutSchema = z.infer<typeof checkoutSchema>;

/**
 * 3️⃣ Now pick from the BASE schema
 */
export const shippingInfoSchema = checkoutBaseSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  address: true,
  city: true,
  postalCode: true,
  orderNotes: true,
});

export const orderDetailsSchema = z.object({
  id: z.string(),
  paymentDate: z.string().optional(),
  products: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
    }),
  ),
  shippingFee: z.number(),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  orderDate: z.string(),
  orderNumber: z.string().optional(),
  status: z.enum(["UNVERIFIED", "PENDING", "CANCELLED", "FULFILLED"]),
  shippingInfo: shippingInfoSchema,
  referenceNumber: z.string(),
  verificationCode: z.string(),
});
