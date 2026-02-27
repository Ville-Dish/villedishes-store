import { isValidEmail } from "@/lib/utils";
import { z } from "zod";

export const EmailTypes = [
  "contact",
  "catering",
  "email_verification",
  "verify_payment",
  "invoice",
  "order_confirmation",
  "order_fulfillment",
  "order_cancellation_request",
  "order_cancellation_confirmation",
] as const;

export type EmailType = (typeof EmailTypes)[number];

const base = z.object({
  to: z
    .email({
      message: "Email is required",
    })
    .refine(isValidEmail, { message: "Please enter a valid email address" }),
});

// NOTE: Dates should be passed as ISO strings from callers.
const itemsSchema = z.array(z.unknown());

export const sendEmailSchema = z.discriminatedUnion("type", [
  base.extend({
    type: z.literal("contact"),
    name: z.string().min(1, "Name is required"),
    message: z.string().min(1, "Message is required"),
    email: z.email("Please enter a valid email address").refine(isValidEmail, {
      message: "Please enter a valid email address",
    }),
    phone: z.string().min(1, "Phone is required"),
    subject: z.string().optional(),
  }),
  base.extend({
    type: z.literal("catering"),
    name: z.string().min(1, "Name is required"),
    email: z.email("Please enter a valid email address").refine(isValidEmail, {
      message: "Please enter a valid email address",
    }),
    cateringDate: z.string().min(1, "Catering date is required"),
    phone: z.string().min(1, "Phone is required"),
    message: z.string().optional(),
    products: z.array(z.string()).min(1, "At least one product is required"),
  }),
  base.extend({
    type: z.literal("email_verification"),
    customerName: z.string().min(1, "Customer name is required"),
    verificationLink: z.string().url("Verification link must be a valid URL"),
  }),
  base.extend({
    type: z.literal("verify_payment"),
    customerName: z.string().min(1, "Customer name is required"),
    paymentAmount: z.number(),
    paymentDate: z.string().min(1, "Payment date is required"),
    paymentMethod: z.string().optional(),
    referenceNumber: z.string().min(1, "Reference number is required"),
    verificationCode: z.string().min(1, "Verification code is required"),
    orderId: z.number(),
    verificationLink: z.url().optional(),
  }),
  base.extend({
    type: z.literal("invoice"),
    customerName: z.string().min(1, "Customer name is required"),
    invoiceNumber: z.string().min(1, "Invoice number is required"),
  }),
  base.extend({
    type: z.literal("order_confirmation"),
    customerName: z.string().min(1, "Customer name is required"),
    orderNumber: z.string().min(1, "Order number is required"),
    orderDate: z.string().min(1, "Order date is required"),
    subtotal: z.number(),
    tax: z.number(),
    shippingFee: z.number(),
    total: z.number(),
    items: itemsSchema,
    estimatedDelivery: z.string().optional(),
  }),
  base.extend({
    type: z.literal("order_fulfillment"),
    customerName: z.string().min(1, "Customer name is required"),
    orderNumber: z.string().min(1, "Order number is required"),
    subtotal: z.number(),
    tax: z.number(),
    shippingFee: z.number(),
    total: z.number(),
    items: itemsSchema,
    feedbackLink: z.url().optional(),
  }),
  base.extend({
    type: z.literal("order_cancellation_request"),
    customerName: z.string().min(1, "Customer name is required"),
    customerInteracEmail: z
      .email("Please enter a valid email address")
      .refine(isValidEmail, {
        message: "Please enter a valid email address",
      }),
    orderNumber: z.string().min(1, "Order number is required"),
    orderDate: z.string().min(1, "Order date is required"),
    total: z.number(),
  }),
  base.extend({
    type: z.literal("order_cancellation_confirmation"),
    customerName: z.string().min(1),
    orderNumber: z.string().min(1),
    total: z.number(),
    // Allow undefined, empty string, or a valid URL so callers can omit or pass ""
    feedbackLink: z.union([z.string().url(), z.literal("")]).optional(),
  }),
]);

export type SendEmailSchema = z.infer<typeof sendEmailSchema>;
