import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { sendEmailSchema } from "../emailSchema";
import { sendEmailAction } from "../actions/sendMail";
import { TRPCError } from "@trpc/server";

export const sendMailRouter = createTRPCRouter({
  sendEmail: publicProcedure
    .input(sendEmailSchema)
    .mutation(async ({ input }) => {
      const { success, error } = await sendEmailAction(input);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send email",
          cause: error,
        });
      }

      return { success };
    }),
});
