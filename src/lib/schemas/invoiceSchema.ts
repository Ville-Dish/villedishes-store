import z from "zod";
import { InvoiceStatus, isValidEmail, isValidPhoneNumber } from "../utils";

// export type InvoiceStatus = ["PAID", "UNPAID", "DUE", "PENDING"];

export const invoiceProductSchema = z.object({
  id: z.string().optional(), // existing products
  basePrice: z.number().positive("Base price is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  price: z.number().positive("Price is required"),
  discount: z.number().min(0).optional().default(0),
  productId: z.string().optional(), // depends on UI structure
});

export const createInvoiceSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z
    .email("Email address is required")
    .refine(isValidEmail, { message: "Please enter a valid email address" }),
  customerPhone: z
    .string({ message: "Phone number is required" })
    .trim()
    .min(1, "Phone number is required")
    .refine(isValidPhoneNumber, {
      message: "Please enter a valid phone number",
    }),

  amount: z.number().positive("Amount is required"),
  // amount: z.coerce.number().positive("Amount is required"),

  dueDate: z.date({ message: "Due date is required" }),

  status: z.enum(InvoiceStatus).optional(),

  // System-generated fields
  invoiceNumber: z.string().optional(),
  dateCreated: z.date({ message: "Service date is required" }).refine(
    (date) => {
      const now = new Date();
      const today = new Date(now.toDateString());
      return date >= today;
    },
    {
      message: "Please select a valid date that is today or later",
    },
  ),

  // Default monetary fields
  //   amountPaid: z.number().optional(),
  //   amountDue: z.number().optional(),
  //   discountPercentage: z.number().int().optional(),
  //   taxRate: z.number().int().optional(),
  //   shippingFee: z.number().int().optional(),
  //   serviceCharge: z.number().int().optional(),
  //   miscellaneous: z.number().int().optional(),

  // No products yet when creating
  //   InvoiceProducts: z.array(invoiceProductSchema).optional(),
});

export type CreateInvoiceSchema = z.infer<typeof createInvoiceSchema>;

export const updateInvoiceSchema = z.object({
  id: z.string().min(1, "Invoice ID is required"),

  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z
    .email("Email address is required")
    .refine(isValidEmail, { message: "Please enter a valid email address" }),
  customerPhone: z
    .string({ message: "Phone number is required" })
    .trim()
    .min(1, "Phone number is required")
    .refine(isValidPhoneNumber, {
      message: "Please enter a valid phone number",
    }),

  amount: z.number().positive("Amount is required"),

  amountPaid: z.number().min(0).default(0),
  amountDue: z.number().min(0).default(0),

  discountPercentage: z.number().int().min(0).default(0),
  taxRate: z.number().int().min(0).default(0),
  shippingFee: z.number().int().min(0).default(0),
  serviceCharge: z.number().int().min(0).default(0),
  miscellaneous: z.number().int().min(0).default(0),

  dueDate: z.string(),
  status: z.string().min(1, "Status is required"),

  InvoiceProducts: z.array(invoiceProductSchema).optional(),
});

export type UpdateInvoiceSchema = z.infer<typeof updateInvoiceSchema>;
