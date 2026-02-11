import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma/client";
import { loginSchema } from "@/lib/schemas/authSchema";

import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";

export const authRouter = createTRPCRouter({
  session: publicProcedure.query(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return session;
  }),

  login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
    const { email, password } = input;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const data = await auth.api.signInEmail({
      body: { email, password, callbackURL: "/admin/dashboard" },
      headers: await headers(),
    });

    return {
      ...data,
      success: true,
    };
  }),
});
