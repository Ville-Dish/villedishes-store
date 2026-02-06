import { getAuthSession } from "@/lib/session/server-session";
import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { cache } from "react";
import superjson from "superjson";

export const createTRPCContext = cache(
  async (opts?: FetchCreateContextFnOptions) => {
    /**
     * @see: https://trpc.io/docs/server/context
     */
    const session = await getAuthSession();

    return { req: opts?.req, session };
  },
);
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    transformer: superjson,
  });

// Routers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const middleware = t.middleware;
export const baseProcedure = t.procedure;

const authMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }
  return next({ ctx: { ...ctx, auth: ctx.session } });
});

// Public rate limiting middleware (IP-based)
const publicMiddleware = middleware(async ({ ctx, next }) => {
  if (ctx.req) {
    console.log("Public");
  }

  return next({ ctx });
});

// Public procedure (no auth required)
export const publicProcedure = baseProcedure.use(publicMiddleware);

// Protected procedure (auth required)
export const protectedProcedure = baseProcedure.use(authMiddleware);
