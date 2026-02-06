import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { testimonialsRouter } from "@/features/testimonials/server/procedures";
export const appRouter = createTRPCRouter({
  testimonials: testimonialsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
