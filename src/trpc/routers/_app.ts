import { createTRPCRouter } from "../init";

import { testimonialsRouter } from "@/features/testimonials/server/procedures";
import { authRouter } from "@/features/auth/server/procedures";
import { sendMailRouter } from "@/features/emails/server/procedures";
import { orderRouter } from "@/features/orders/server/procedures";
import { productsRouter } from "@/features/products/server/procedures";
import { invoiceRouter } from "@/features/invoices/server/procedures";
import { cloudinaryRouter } from "@/features/cloudinay/server/procedures";
import { dashboardProcedures } from "@/features/admin/dashboard/server/procedures";

export const appRouter = createTRPCRouter({
  testimonials: testimonialsRouter,
  auth: authRouter,
  mail: sendMailRouter,
  orders: orderRouter,
  products: productsRouter,
  invoices: invoiceRouter,
  cloudinary: cloudinaryRouter,
  dashboard: dashboardProcedures,
});

// export type definition of API
export type AppRouter = typeof appRouter;
