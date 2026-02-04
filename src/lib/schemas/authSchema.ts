import z from "zod";
import { isValidEmail, isValidPhoneNumber, passwordStrength } from "../utils";
import { PASSWORD_LENGTH } from "../constantData";

export const passwordResetSchema = z.object({
  email: z.email({
    message: "Email is required",
  }),
});

export type PasswordResetValues = z.infer<typeof passwordResetSchema>;

export const twoFactorToggleSchema = z.object({
  password: z.string().min(1, {
    message: "Password is required for authentication",
  }),
});

export type TwoFactorToggleValues = z.infer<typeof twoFactorToggleSchema>;

export const loginSchema = passwordResetSchema.extend({
  password: z.string().min(1, {
    message: "Password is required for authentication",
  }),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    firstName: z.string().trim().min(1, {
      message: "First name is required",
    }),
    lastName: z.string().trim().min(1, {
      message: "Last name is required",
    }),
    email: z
      .email({
        message: "Email is required",
      })
      .refine(isValidEmail, { message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(1, "Password is required")
      .min(PASSWORD_LENGTH, "Password must be at least 8 characters")
      .refine(
        (val) => {
          const level = passwordStrength(val).strength;
          console.log(level);
          return level !== "weak";
        },
        {
          message: "Password is too weak",
        }
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    phoneNumber: z.string().optional(),
    userName: z.string().optional(),
    image: z.url().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type SignupSchema = z.infer<typeof signupSchema>;

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, {}),
  lastName: z.string().trim().min(1, {}),
  userName: z.string().optional(),
  image: z.url().optional(),
  phoneNumber: z
    .string({ message: "Phone number is required" })
    .trim()
    .min(1, "Phone number is required")
    .refine(isValidPhoneNumber, {
      message: "Please enter a valid phone number",
    }),
  street: z.string().trim().min(1, "Street address is required"),

  city: z.string().trim().min(1, "City is required"),

  province: z.string().min(1, "Province is required"),

  postalCode: z
    .string()
    .min(3, "Postal code must be at least 3 characters")
    .max(10, "Postal code must be at most 10 characters"),

  country: z.string().min(1, "Country is required"),
});
