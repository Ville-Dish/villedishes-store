import { z } from "zod";
import { isValidEmail, isValidPhoneNumber } from "../utils";

export const contactSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }).max(50),
  email: z
    .email({
      message: "Email is required",
    })
    .refine(isValidEmail, { message: "Please enter a valid email address" }),
  phoneNumber: z
    .string({ message: "Phone number is required" })
    .trim()
    .min(1, "Phone number is required")
    .refine(isValidPhoneNumber, {
      message: "Please enter a valid phone number",
    }),
  subject: z.string().min(2, "Subject is required").max(100),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500),
});
export type ContactFormData = z.infer<typeof contactSchema>;

export const cateringSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }).max(50),
  email: z
    .email({
      message: "Email is required",
    })
    .refine(isValidEmail, { message: "Please enter a valid email address" }),
  phoneNumber: z
    .string({ message: "Phone number is required" })
    .trim()
    .min(1, "Phone number is required")
    .refine(isValidPhoneNumber, {
      message: "Please enter a valid phone number",
    }),
  cateringDate: z.date().min(1, "Catering date is required"),
  message: z.string().optional(),
  products: z.array(z.string()).min(1, "Please select at least one product"),
});

export type CateringFormData = z.infer<typeof cateringSchema>;
