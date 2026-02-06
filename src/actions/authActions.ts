"use server";
import { auth } from "@/lib/auth";
import { comparePassword } from "@/lib/compare-password";
import prisma from "@/lib/prisma/client";
import {
  loginSchema,
  LoginSchema,
  signupSchema,
  SignupSchema,
} from "@/lib/schemas/authSchema";

//Sign In Action
export const signInAction = async (values: LoginSchema) => {
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error("Invalid email/password");
  }

  const { email, password } = validatedFields.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("User not found");
  }

  const data = await auth.api.signInEmail({
    body: { email, password },
    // headers: await headers(),
  });

  return { data, success: true };
};

//Sign Up Action
export const signUpAction = async (values: SignupSchema) => {
  const users = await prisma.user.count();

  if (users >= 3) {
    throw new Error("User registration limit reached");
  }
  const validatedFields = signupSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error("Check the form for errors");
  }

  const { firstName, lastName, confirmPassword, ...otherFields } =
    validatedFields.data;

  const samePassword = await comparePassword(
    otherFields.password,
    confirmPassword
  );

  if (!samePassword) {
    throw new Error("Your passwords do not match");
  }

  const name = `${firstName} ${lastName}`;

  const data = await auth.api.signUpEmail({
    body: { name, ...otherFields, callbackURL: "/login" },
    //   headers: await headers(),
  });

  if (!data) {
    throw new Error("User registration failed");
  }
  return { data, success: true };
};
