import { OrderStatus, PaymentMethod } from "@/generated/prisma/enums";
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
      code: "custom",
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
  status: z.enum(OrderStatus),
  shippingInfo: shippingInfoSchema,
  referenceNumber: z.string(),
  verificationCode: z.string(),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string(),
  providedVerificationCode: z.string(),
});

export type VerifyPaymentValue = z.infer<typeof verifyPaymentSchema>;

export const cancelOrderRequestSchema = z
  .object({
    orderId: z.string(),
    paymentType: z.enum(PaymentMethod),
    interacEmail: z.email().optional(),
    cancellationReason: z.string(),
  })
  .refine(
    (data) => {
      if (data.paymentType === "ETRANSFER") {
        return !!data.interacEmail && data.interacEmail.length > 0;
      }
      return true;
    },
    {
      message: "Interac email is required for e-transfer refunds",
      path: ["interacEmail"],
    },
  );

export type CancelOrderRequestValue = z.infer<typeof cancelOrderRequestSchema>;

export const cancelOrderProcessSchema = z.object({
  orderId: z.string(),
  refundReferenceNumber: z.string(),
});

export type CancelOrderProcessValue = z.infer<typeof cancelOrderProcessSchema>;

export const reviewSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  author: z.string().min(1, "Your name is required"),
  isAnonymous: z.boolean().default(false),
  reviews: z
    .array(
      z.object({
        orderProductId: z.string().min(1),
        rating: z.number().min(1, "Rating is required").max(5),
        comment: z.string().optional().default(""),
      }),
    )
    .min(1, "At least one review is required"),
});

export type ReviewValue = z.infer<typeof reviewSchema>;
