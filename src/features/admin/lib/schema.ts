import { isValidPhoneNumber } from "@/lib/utils";
import { addRequestMeta } from "next/dist/server/request-meta";
import z from "zod";

export const revenueSchema = z.object({
  id: z.string().optional(),
  year: z.number(),
  yearlyTarget: z.number(),
  monthlyProjections: z.array(
    z.object({
      id: z.string(),
      month: z.string(),
      projection: z.number(),
      actual: z.number().optional(),
    }),
  ),
});

export type RevenueValue = z.infer<typeof revenueSchema>;

export const incomeExpenseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be a positive number"),
  date: z.date(),
});

export type IncomeExpenseValue = z.infer<typeof incomeExpenseSchema>;

export const companySettingsSchema = z.object({
  id: z.string().optional(),
  companyName: z.string().min(1, "Company name is required"),
  about: z.string().optional(),
  founderNotes: z.string().optional(),
  supportEmail: z.email("Please enter a valid email address").optional(),
  supportPhone: z
    .string({ message: "Phone number is required" })
    .trim()
    .min(1, "Phone number is required")
    .refine(isValidPhoneNumber, {
      message: "Please enter a valid phone number",
    })
    .optional(),
  website: z.url("Please enter a valid URL").optional(),
  address: z.string().optional(),
  logoUrl: z.url("Please enter a valid URL").optional(),
});

export type CompanySettingsValue = z.infer<typeof companySettingsSchema>;
