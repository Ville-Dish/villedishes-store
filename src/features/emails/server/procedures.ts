import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { sendEmailSchema } from "../emailSchema";
import { sendEmailAction } from "../actions/sendMail";
import { TRPCError } from "@trpc/server";
import { DEFAULT_COLUMN_MAPPINGS } from "@/lib/invoicePdfGenerate";

export const sendMailRouter = createTRPCRouter({
  sendEmail: publicProcedure
    .input(sendEmailSchema)
    .mutation(async ({ input }) => {
      // Extract invoice PDF info when type is "invoice"
      const invoiceInfo =
        input.type === "invoice" && input.invoice
          ? {
              invoiceData: input.invoice,
              displayMode: input.displayMode ?? "detailed",
              categoryMappings: input.categoryMappings ?? {},
              columnMappings: input.columnMappings ?? DEFAULT_COLUMN_MAPPINGS,
            }
          : undefined;
      const { success, error } = await sendEmailAction(input, invoiceInfo);

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
